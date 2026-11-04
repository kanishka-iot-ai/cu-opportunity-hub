import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Detect Vercel serverless environment
IS_VERCEL = bool(os.getenv('VERCEL') or os.getenv('VERCEL_ENV'))

if IS_VERCEL:
    DEFAULT_SQLITE_PATH = '/tmp/cu_opportunity_hub.db'
else:
    DATABASE_DIR = os.path.join(BASE_DIR, 'database')
    os.makedirs(DATABASE_DIR, exist_ok=True)
    DEFAULT_SQLITE_PATH = os.path.join(DATABASE_DIR, 'cu_opportunity_hub.db')

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'cu-hub-super-secret-key-2026-cuchd')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'cu-jwt-secret-key-chandigarh-univ-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # Primary MySQL / PostgreSQL with automatic SQLite fallback
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL:
        # Normalize legacy postgres:// to postgresql://
        if DATABASE_URL.startswith('postgres://'):
            DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    elif IS_VERCEL:
        SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/cu_opportunity_hub.db'
    else:
        # Cross-platform local path
        db_path = DEFAULT_SQLITE_PATH.replace('\\', '/')
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
    } if not SQLALCHEMY_DATABASE_URI.startswith('sqlite') else {}

    # University branding
    UNIVERSITY_NAME = "Chandigarh University"
    PORTAL_NAME = "CU OPPORTUNITY HUB"
    INSTITUTION_DOMAIN = "cuchd.in"
