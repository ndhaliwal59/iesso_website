# IESO Backend API

FastAPI backend for the IESO energy forecasting application.

## Setup

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   Create a `.env` file in the backend directory with the following variables:
   ```bash
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your_bucket_name_here
   
   # API Configuration
   API_HOST=0.0.0.0
   API_PORT=8000
   ```
   Note: AWS credentials are optional for now and only needed when implementing S3 integration.

4. **Run the development server:**
   ```bash
   python main.py
   # Or using uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API documentation will be available at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py              # Main FastAPI application
├── config.py            # Configuration settings
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create this file)
├── routers/             # API route handlers
│   └── __init__.py
└── services/            # Business logic services
    ├── __init__.py
    └── s3_service.py    # AWS S3 integration service
```

## Features

- FastAPI with automatic API documentation
- CORS middleware configured for frontend communication
- AWS S3 service ready for future integration
- Environment-based configuration
- Health check endpoints

## Future Enhancements

- Add S3 data fetching endpoints in `routers/`
- Implement data processing and transformation logic
- Add authentication and authorization
- Add database integration if needed
- Add caching layer for frequently accessed S3 data

