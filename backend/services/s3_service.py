"""
AWS S3 service for fetching data from S3 buckets.
This service will be implemented when AWS S3 integration is needed.
"""
import boto3
from botocore.exceptions import ClientError
from typing import Optional
from config import settings
import logging

logger = logging.getLogger(__name__)

class S3Service:
    """Service for interacting with AWS S3 buckets."""
    
    def __init__(self):
        self.s3_client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the S3 client with credentials from settings."""
        try:
            if settings.aws_access_key_id and settings.aws_secret_access_key:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                    region_name=settings.aws_region
                )
                logger.info("S3 client initialized successfully")
            else:
                logger.warning("AWS credentials not configured. S3 client not initialized.")
        except Exception as e:
            logger.error(f"Error initializing S3 client: {e}")
    
    def get_object(self, key: str, bucket_name: Optional[str] = None) -> Optional[bytes]:
        """
        Retrieve an object from S3.
        
        Args:
            key: The S3 object key
            bucket_name: The bucket name (defaults to configured bucket)
        
        Returns:
            The object content as bytes, or None if error
        """
        if not self.s3_client:
            logger.error("S3 client not initialized")
            return None
        
        bucket = bucket_name or settings.s3_bucket_name
        if not bucket:
            logger.error("S3 bucket name not configured")
            return None
        
        try:
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            return response['Body'].read()
        except ClientError as e:
            logger.error(f"Error retrieving object from S3: {e}")
            return None
    
    def list_objects(self, prefix: str = "", bucket_name: Optional[str] = None) -> list:
        """
        List objects in S3 bucket with optional prefix filter.
        
        Args:
            prefix: Prefix to filter objects
            bucket_name: The bucket name (defaults to configured bucket)
        
        Returns:
            List of object keys
        """
        if not self.s3_client:
            logger.error("S3 client not initialized")
            return []
        
        bucket = bucket_name or settings.s3_bucket_name
        if not bucket:
            logger.error("S3 bucket name not configured")
            return []
        
        try:
            response = self.s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
            if 'Contents' in response:
                return [obj['Key'] for obj in response['Contents']]
            return []
        except ClientError as e:
            logger.error(f"Error listing objects from S3: {e}")
            return []
    
    def list_objects_with_metadata(self, prefix: str = "", bucket_name: Optional[str] = None) -> list:
        """
        List objects in S3 bucket with metadata (key and last modified date).
        
        Args:
            prefix: Prefix to filter objects
            bucket_name: The bucket name (defaults to configured bucket)
        
        Returns:
            List of dicts with 'Key' and 'LastModified' keys
        """
        if not self.s3_client:
            logger.error("S3 client not initialized")
            return []
        
        bucket = bucket_name or settings.s3_bucket_name
        if not bucket:
            logger.error("S3 bucket name not configured")
            return []
        
        try:
            response = self.s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
            if 'Contents' in response:
                return [
                    {
                        'Key': obj['Key'],
                        'LastModified': obj['LastModified']
                    }
                    for obj in response['Contents']
                ]
            return []
        except ClientError as e:
            logger.error(f"Error listing objects from S3: {e}")
            return []

# Global instance
s3_service = S3Service()

