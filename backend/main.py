from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.s3_service import s3_service
from config import settings
from botocore.exceptions import ClientError
import csv
import io
import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional

app = FastAPI(
    title="IESO API",
    description="Backend API for IESO energy forecasting application",
    version="1.0.0",
)

# Configure CORS to allow frontend requests
# Allow localhost for development and all Render subdomains for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://ontario-energy-forecast.onrender.com",  # Frontend URL
    ],
    allow_origin_regex=r"https://.*\.onrender\.com",  # Allow all Render subdomains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "IESO API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "IESO API"}

@app.get("/test/s3")
async def test_s3():
    """
    Test endpoint to verify S3 connection and configuration.
    Returns detailed status about S3 setup and connectivity.
    """
    result = {
        "s3_client_initialized": s3_service.s3_client is not None,
        "config": {
            "aws_access_key_id_set": bool(settings.aws_access_key_id),
            "aws_secret_access_key_set": bool(settings.aws_secret_access_key),
            "aws_region": settings.aws_region,
            "s3_bucket_name": settings.s3_bucket_name,
        },
        "bucket_access": None,
        "error": None
    }
    
    # Check if credentials are configured
    if not settings.aws_access_key_id or not settings.aws_secret_access_key:
        result["error"] = "AWS credentials not configured in environment variables"
        return result
    
    if not settings.s3_bucket_name:
        result["error"] = "S3 bucket name not configured in environment variables"
        return result
    
    # Test bucket access
    if s3_service.s3_client:
        try:
            # Try to list objects (limited to first 10 for testing)
            objects = s3_service.list_objects()
            result["bucket_access"] = "success"
            result["object_count"] = len(objects)
            result["sample_objects"] = objects[:10]  # First 10 objects as sample
            
            # Also try to get bucket location
            try:
                location = s3_service.s3_client.get_bucket_location(Bucket=settings.s3_bucket_name)
                result["bucket_location"] = location.get('LocationConstraint', 'us-east-1')
            except:
                pass
                
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            result["bucket_access"] = "failed"
            result["error"] = f"AWS Error ({error_code}): {error_message}"
        except Exception as e:
            result["bucket_access"] = "failed"
            result["error"] = f"Unexpected error: {str(e)}"
    else:
        result["error"] = "S3 client failed to initialize"
    
    return result

def get_today_ontario_date() -> date:
    """
    Get today's date in Ontario/Eastern timezone.
    Ontario is UTC-5 (EST) or UTC-4 (EDT), so we subtract 5 hours from UTC.
    This ensures we get the correct date regardless of server timezone (e.g., UTC on Render).
    """
    utc_now = datetime.utcnow()
    # Subtract 5 hours to get Eastern time
    ontario_time = utc_now - timedelta(hours=5)
    return ontario_time.date()

def get_actual_demand_from_training_dataset(target_date: Optional[date] = None) -> Dict[str, Optional[float]]:
    """
    Fetch actual demand values from the training dataset in S3.
    Fetches from the specific file: training_dataset/daily.csv
    Uses the "Ontario Demand" column and filters for target date and previous day (to handle midnight crossover).
    Returns a dictionary mapping hour strings (HH:MM) to actual demand values (or None if not available).
    
    Args:
        target_date: The date to fetch data for (defaults to today)
    
    Returns:
        Dictionary with hour as key and actual demand as value (or None if not available)
    """
    actual_demand_map = {}
    
    try:
        # Use today's date in Ontario timezone if not specified
        if target_date is None:
            target_date = get_today_ontario_date()
        
        print(f"Fetching actual demand for date: {target_date}")
        
        # Fetch the specific CSV file from S3
        file_key = "training_dataset/daily.csv"
        csv_data = s3_service.get_object(file_key)
        
        if csv_data is None:
            print(f"Error: Could not fetch {file_key} from S3")
            return actual_demand_map
        
        csv_string = csv_data.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_string))
        
        # Get column names (case-insensitive matching)
        fieldnames = csv_reader.fieldnames
        if not fieldnames:
            print("Error: CSV has no column headers")
            return actual_demand_map
        
        print(f"CSV columns found: {fieldnames}")
        
        # Find Date column (case-insensitive)
        date_col = None
        for col in fieldnames:
            col_lower = col.lower().strip()
            if col_lower == 'date':
                date_col = col
                break
        
        # Find Hour column (case-insensitive)
        hour_col = None
        for col in fieldnames:
            col_lower = col.lower().strip()
            if col_lower == 'hour':
                hour_col = col
                break
        
        # Find demand column (case-insensitive, looking for "ontario demand")
        demand_col = None
        for col in fieldnames:
            col_lower = col.lower().strip()
            if 'ontario' in col_lower and 'demand' in col_lower:
                demand_col = col
                break
        
        if not date_col:
            print(f"Error: Could not find 'Date' column. Available columns: {fieldnames}")
            return actual_demand_map
        
        if not hour_col:
            print(f"Error: Could not find 'Hour' column. Available columns: {fieldnames}")
            return actual_demand_map
        
        if not demand_col:
            print(f"Error: Could not find 'Ontario Demand' column. Available columns: {fieldnames}")
            return actual_demand_map
        
        print(f"Using date column: '{date_col}', hour column: '{hour_col}', demand column: '{demand_col}'")
        
        rows_processed = 0
        rows_matched = 0
        sample_rows_logged = 0
        date_mismatches = 0
        date_matches = 0
        
        # Parse the CSV to extract actual demand values from "Ontario Demand" column
        for row in csv_reader:
            rows_processed += 1
            
            # Log first few rows for debugging
            if sample_rows_logged < 3:
                print(f"Sample row {sample_rows_logged + 1}: {dict(row)}")
                sample_rows_logged += 1
            
            try:
                date_str = row.get(date_col, '').strip()
                hour_str = row.get(hour_col, '').strip()
                
                if not date_str or not hour_str:
                    if rows_processed <= 5:
                        print(f"Row {rows_processed}: Missing date or hour - date_str='{date_str}', hour_str='{hour_str}'")
                    continue
                
                # Parse the date (format: "2002-05-01")
                try:
                    row_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                except ValueError:
                    # Try alternative date formats
                    try:
                        row_date = datetime.strptime(date_str, "%Y/%m/%d").date()
                    except ValueError:
                        if rows_processed <= 5:
                            print(f"Row {rows_processed}: Could not parse date '{date_str}'")
                        continue
                
                # Check if this row is for the target date
                if row_date != target_date:
                    date_mismatches += 1
                    if rows_processed <= 5:
                        print(f"Row {rows_processed}: Date mismatch - row_date={row_date}, target_date={target_date}")
                    continue
                
                date_matches += 1
                
                # Parse the hour (format: 1-24)
                # Note: Hour 1 in dataset = 00:00-01:00, so maps to "00:00"
                #       Hour 2 in dataset = 01:00-02:00, so maps to "01:00"
                #       Hour N maps to (N-1):00
                try:
                    hour_num = int(hour_str)
                    if hour_num < 1 or hour_num > 24:
                        print(f"Row {rows_processed}: Invalid hour number {hour_num}")
                        continue
                    # Convert to HH:MM format: hour 1 -> "00:00", hour 2 -> "01:00", etc.
                    hour_formatted = f"{(hour_num - 1):02d}:00"
                except (ValueError, TypeError) as e:
                    print(f"Row {rows_processed}: Could not parse hour '{hour_str}': {e}")
                    continue
                
                # Get demand value from "Ontario Demand" column
                demand_str = row.get(demand_col, '').strip()
                if not demand_str or demand_str.lower() in ['', 'na', 'n/a', 'null', 'none']:
                    if rows_processed <= 5:
                        print(f"Row {rows_processed}: Empty or invalid demand value '{demand_str}'")
                    continue
                
                try:
                    demand_value = float(demand_str)
                except (ValueError, TypeError) as e:
                    if rows_processed <= 5:
                        print(f"Row {rows_processed}: Could not convert demand '{demand_str}' to float: {e}")
                    continue
                
                # Store the actual demand value
                actual_demand_map[hour_formatted] = round(demand_value)
                rows_matched += 1
                
                if rows_matched <= 5:
                    print(f"✓ Matched row {rows_processed}: date={row_date}, hour={hour_num} -> '{hour_formatted}', demand={demand_value}")
                        
            except Exception as e:
                # Skip rows that can't be parsed
                if rows_processed <= 10:
                    print(f"Row {rows_processed}: Exception during parsing: {e}")
                continue
        
        print(f"=" * 60)
        print(f"ACTUAL DEMAND FETCH SUMMARY:")
        print(f"  Target date: {target_date}")
        print(f"  Total rows processed: {rows_processed}")
        print(f"  Rows with matching date: {date_matches}")
        print(f"  Rows with non-matching date: {date_mismatches}")
        print(f"  Rows successfully matched and added: {rows_matched}")
        print(f"  Hours with actual demand data: {len(actual_demand_map)}")
        if actual_demand_map:
            print(f"  Sample hours found: {sorted(list(actual_demand_map.keys()))[:10]}")
            print(f"  Sample values: {[(k, actual_demand_map[k]) for k in sorted(list(actual_demand_map.keys()))[:5]]}")
        else:
            print(f"  WARNING: No actual demand data found for date {target_date}!")
        print(f"=" * 60)
        
    except Exception as e:
        # Log error but don't fail - return whatever we have
        print(f"Error fetching actual demand from training dataset: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return actual_demand_map

@app.get("/api/test/actual-demand")
async def test_actual_demand():
    """
    Test endpoint to debug actual demand fetching from training dataset.
    Returns information about the CSV structure and sample data.
    """
    try:
        file_key = "training_dataset/daily.csv"
        csv_data = s3_service.get_object(file_key)
        
        if csv_data is None:
            return {
                "error": f"Could not fetch {file_key} from S3",
                "file_exists": False
            }
        
        csv_string = csv_data.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_string))
        
        fieldnames = csv_reader.fieldnames
        if not fieldnames:
            return {"error": "CSV has no column headers"}
        
        # Get first 5 rows as sample
        sample_rows = []
        for i, row in enumerate(csv_reader):
            if i >= 5:
                break
            sample_rows.append(dict(row))
        
        # Try to get actual demand for today
        today = date.today()
        actual_demand_map = get_actual_demand_from_training_dataset(today)
        
        return {
            "file_exists": True,
            "columns": fieldnames,
            "sample_rows": sample_rows,
            "target_date": str(today),
            "actual_demand_found": len(actual_demand_map),
            "actual_demand_map": actual_demand_map,
            "sample_hours": list(actual_demand_map.keys())[:10] if actual_demand_map else []
        }
        
    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@app.get("/api/forecast/latest")
async def get_latest_forecast():
    """
    Fetch the latest forecast CSV from S3 and return formatted forecast data.
    Merges actual demand values from training_dataset when available.
    Returns forecast data with hour, predicted demand, and actual demand (or N/A if not available).
    """
    try:
        # Fetch the CSV file from S3
        csv_key = "daily_prediction/latest_forecast.csv"
        csv_data = s3_service.get_object(csv_key)
        
        if csv_data is None:
            raise HTTPException(status_code=404, detail="Forecast file not found in S3")
        
        # Parse CSV data
        csv_string = csv_data.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_string))
        
        forecast_data = []
        first_time_str = None
        forecast_date = None
        
        # First pass: collect forecast data and determine the date
        for row in csv_reader:
            # Parse the time string
            time_str = row['time'].strip()
            
            # Store first time for timestamp
            if first_time_str is None:
                first_time_str = time_str
                try:
                    forecast_date = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S").date()
                except ValueError:
                    pass
            
            try:
                # Parse datetime (format: "2025-10-17 01:00:00")
                dt = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
                # Format hour as HH:MM
                hour = dt.strftime("%H:%M")
            except ValueError:
                # Fallback: try to extract hour if format is different
                hour = time_str.split()[1][:5] if len(time_str.split()) > 1 else "00:00"
            
            # Extract predicted demand (round to integer)
            predicted = float(row['predicted_ontario_demand'].strip())
            
            forecast_data.append({
                "hour": hour,
                "predicted": round(predicted),
                "actual": None  # Will be filled from training dataset
            })
        
        # Use today's date in Ontario timezone for fetching actual demand (not the forecast CSV date)
        # This ensures we get today's actual demand values, even if the forecast is for a different date
        # Using Ontario timezone accounts for Render using UTC (subtract 5 hours)
        today_date = get_today_ontario_date()
        print(f"Forecast CSV date: {forecast_date}, Using today's date (Ontario time) for actual demand: {today_date}")
        
        # Fetch actual demand values from training dataset
        # Use today's date to get current actual demand values
        print(f"\n{'='*60}")
        print(f"FORECAST ENDPOINT: Fetching actual demand for today's date={today_date}")
        print(f"  (Forecast CSV date was: {forecast_date})")
        print(f"{'='*60}")
        actual_demand_map = get_actual_demand_from_training_dataset(today_date)
        
        print(f"\nFORECAST ENDPOINT: Received actual_demand_map with {len(actual_demand_map)} entries")
        if actual_demand_map:
            print(f"  Sample actual demand hours: {sorted(list(actual_demand_map.keys()))[:10]}")
            print(f"  Sample actual demand values: {[(k, actual_demand_map[k]) for k in sorted(list(actual_demand_map.keys()))[:5]]}")
        
        # Merge actual demand values with forecast data
        merged_count = 0
        not_found_count = 0
        forecast_hours = [item['hour'] for item in forecast_data]
        print(f"\nFORECAST ENDPOINT: Merging actual demand into {len(forecast_data)} forecast data points")
        print(f"  Forecast hours: {sorted(forecast_hours)[:10]}...")
        
        for item in forecast_data:
            hour = item['hour']
            if hour in actual_demand_map and actual_demand_map[hour] is not None:
                item['actual'] = actual_demand_map[hour]
                merged_count += 1
                if merged_count <= 5:
                    print(f"  ✓ Merged hour {hour}: actual={actual_demand_map[hour]}")
            else:
                # Keep as None (frontend should handle this as N/A)
                item['actual'] = None
                not_found_count += 1
                if not_found_count <= 5:
                    print(f"  ✗ No actual data for hour {hour}")
        
        print(f"\nFORECAST ENDPOINT MERGE SUMMARY:")
        print(f"  Total forecast hours: {len(forecast_data)}")
        print(f"  Hours with actual demand merged: {merged_count}")
        print(f"  Hours without actual demand: {not_found_count}")
        print(f"{'='*60}\n")
        
        # Find peak and low values (only from predicted for now, since actual might be incomplete)
        peak_data = max(forecast_data, key=lambda x: x['predicted'])
        low_data = min(forecast_data, key=lambda x: x['predicted'])
        
        # Get the timestamp from the first row's time
        timestamp = "N/A"
        if first_time_str:
            try:
                first_dt = datetime.strptime(first_time_str, "%Y-%m-%d %H:%M:%S")
                timestamp = first_dt.strftime("%I:%M %p")
            except:
                pass
        
        return {
            "forecast_data": forecast_data,
            "peak": {
                "hour": peak_data['hour'],
                "demand": peak_data['predicted']
            },
            "low": {
                "hour": low_data['hour'],
                "demand": low_data['predicted']
            },
            "timestamp": timestamp,
            "total_hours": len(forecast_data)
        }
        
    except HTTPException:
        raise
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', str(e))
        raise HTTPException(
            status_code=500,
            detail=f"AWS Error ({error_code}): {error_message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing forecast data: {str(e)}"
        )

@app.get("/api/hourly-data/latest")
async def get_latest_hourly_data():
    """
    Fetch the most recent hourly data JSON from S3 and return supply breakdown and import/export data.
    Returns supply breakdown (Nuclear, Wind, Hydro, Solar, Gas, Biofuel) and import/export values.
    """
    try:
        # List all objects in hourly_data/ folder
        prefix = "hourly_data/"
        objects_with_metadata = s3_service.list_objects_with_metadata(prefix=prefix)
        
        if not objects_with_metadata:
            raise HTTPException(status_code=404, detail="No hourly data files found in S3")
        
        # Find the most recent file by LastModified timestamp
        most_recent = max(objects_with_metadata, key=lambda x: x['LastModified'])
        most_recent_key = most_recent['Key']
        
        # Fetch the JSON file
        json_data = s3_service.get_object(most_recent_key)
        
        if json_data is None:
            raise HTTPException(status_code=404, detail="Failed to fetch hourly data file from S3")
        
        # Parse JSON data
        data = json.loads(json_data.decode('utf-8'))
        
        # Extract supply breakdown and import/export data
        supply_data = data.get('data', {})
        
        # Map supply sources with their colors
        supply_breakdown = [
            {
                "source": "Nuclear",
                "mw": supply_data.get('Nuclear', 0),
                "color": "#8B5CF6"
            },
            {
                "source": "Gas",
                "mw": supply_data.get('Gas', 0),
                "color": "#EF4444"
            },
            {
                "source": "Wind",
                "mw": supply_data.get('Wind', 0),
                "color": "#10B981"
            },
            {
                "source": "Hydro",
                "mw": supply_data.get('Hydro', 0),
                "color": "#3B82F6"
            },
            {
                "source": "Solar",
                "mw": supply_data.get('Solar', 0),
                "color": "#FBBF24"
            },
            {
                "source": "Biofuel",
                "mw": supply_data.get('Biofuel', 0),
                "color": "#84CC16"
            }
        ]
        
        # Get imports and exports
        imports = supply_data.get('HourlyImports', 0)
        exports = supply_data.get('HourlyExports', 0)
        
        return {
            "supply_breakdown": supply_breakdown,
            "imports": imports,
            "exports": exports,
            "fetched_at": data.get('fetched_at_utc', ''),
            "file_key": most_recent_key
        }
        
    except HTTPException:
        raise
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', str(e))
        raise HTTPException(
            status_code=500,
            detail=f"AWS Error ({error_code}): {error_message}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing hourly data: {str(e)}"
        )

# Future endpoints will be added here
# app.include_router(data.router, prefix="/api/data", tags=["data"])
# app.include_router(s3.router, prefix="/api/s3", tags=["s3"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

