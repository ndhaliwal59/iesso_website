from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.s3_service import s3_service
from config import settings
from botocore.exceptions import ClientError
import csv
import io
import json
from datetime import datetime
from typing import List, Dict

app = FastAPI(
    title="IESO API",
    description="Backend API for IESO energy forecasting application",
    version="1.0.0",
)

# Configure CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Common Vite ports
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

@app.get("/api/forecast/latest")
async def get_latest_forecast():
    """
    Fetch the latest forecast CSV from S3 and return formatted forecast data.
    Returns forecast data with hour, predicted demand, and formatted timestamp.
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
        
        for row in csv_reader:
            # Parse the time string
            time_str = row['time'].strip()
            
            # Store first time for timestamp
            if first_time_str is None:
                first_time_str = time_str
            
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
                "actual": round(predicted)  # Using predicted as actual for now since CSV doesn't have actual data
            })
        
        # Find peak and low values
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

