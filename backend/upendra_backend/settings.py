import os
from pathlib import Path
from datetime import timedelta

try:
    import dj_database_url
except ImportError:
    dj_database_url = None

try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file (if python-dotenv is present locally)
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    pass

# Secret key: Read from environment, fallback to secure local dev key
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    os.environ.get('SECRET_KEY', 'django-insecure-upendra-grocery-secret-key-2026-kirana-store-local-market-trusted')
)

# Debug: Defaults to False in production unless explicitly set to True
DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')

# Allowed Hosts: Configurable via comma-separated ALLOWED_HOSTS environment variable
allowed_hosts_env = os.environ.get('ALLOWED_HOSTS', '')
if allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]
elif DEBUG:
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com']

AUTH_USER_MODEL = 'store.CustomUser'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'store',
]

# Add whitenoise runserver if installed
try:
    import whitenoise
    INSTALLED_APPS.insert(5, 'whitenoise.runserver_nostatic')
except ImportError:
    pass


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configure WhiteNoise dynamically if installed
try:
    import whitenoise
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE_BACKEND = "whitenoise.storage.CompressedStaticFilesStorage"
except ImportError:
    STATICFILES_STORAGE_BACKEND = "django.contrib.staticfiles.storage.StaticFilesStorage"

ROOT_URLCONF = 'upendra_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'upendra_backend.wsgi.application'

# Database Configuration
# 1. Production: PostgreSQL via DATABASE_URL (e.g., Neon Free tier)
# 2. Production/Custom: PostgreSQL via individual DB_* environment variables
# 3. Local optional: MySQL when USE_MYSQL=True
# 4. Local default fallback: SQLite (upendra_store.sqlite3)
def _clean_env_val(val):
    if not val:
        return ''
    s = str(val).strip().strip("'\"`")
    if s.startswith('psql '):
        s = s[5:].strip().strip("'\"`")
    return s

DATABASE_URL = _clean_env_val(os.environ.get('DATABASE_URL', ''))
USE_MYSQL = os.environ.get('USE_MYSQL', 'False').lower() in ('true', '1', 'yes')
USE_POSTGRES = os.environ.get('USE_POSTGRES', 'False').lower() in ('true', '1', 'yes')
DB_ENGINE = _clean_env_val(os.environ.get('DB_ENGINE', '')).lower()
DB_NAME = _clean_env_val(os.environ.get('DB_NAME', ''))
DB_USER = _clean_env_val(os.environ.get('DB_USER', ''))
DB_PASSWORD = _clean_env_val(os.environ.get('DB_PASSWORD', ''))
DB_HOST = _clean_env_val(os.environ.get('DB_HOST', ''))
DB_PORT = _clean_env_val(os.environ.get('DB_PORT', ''))

# If DB_HOST or DB_NAME was accidentally provided as the full postgres connection URL
if not DATABASE_URL:
    if DB_HOST.startswith(('postgres://', 'postgresql://')):
        DATABASE_URL = DB_HOST
        DB_HOST = ''
    elif DB_NAME.startswith(('postgres://', 'postgresql://')):
        DATABASE_URL = DB_NAME
        DB_NAME = ''

if DATABASE_URL and dj_database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True if 'neon.tech' in DATABASE_URL or 'sslmode=require' in DATABASE_URL else False,
        )
    }

elif USE_MYSQL:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': DB_NAME or 'upendra_store_db',
            'USER': DB_USER or 'root',
            'PASSWORD': DB_PASSWORD or 'root',
            'HOST': DB_HOST or 'localhost',
            'PORT': DB_PORT or '3306',
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            }
        }
    }
elif (DB_HOST and DB_PORT != '3306') or USE_POSTGRES or DB_ENGINE == 'postgresql':
    # Clean host in case of protocol, path or port
    clean_host = DB_HOST
    for prefix in ('https://', 'http://', 'postgresql://', 'postgres://'):
        if clean_host.startswith(prefix):
            clean_host = clean_host[len(prefix):]
    if '/' in clean_host:
        clean_host = clean_host.split('/')[0]
    if '?' in clean_host:
        clean_host = clean_host.split('?')[0]
    if ':' in clean_host:
        host_part, port_part = clean_host.split(':', 1)
        clean_host = host_part
        if not DB_PORT:
            DB_PORT = port_part

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': DB_NAME or 'neondb',
            'USER': DB_USER or 'postgres',
            'PASSWORD': DB_PASSWORD or '',
            'HOST': clean_host,
            'PORT': DB_PORT or '5432',
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'sslmode': 'require'
            } if 'neon.tech' in clean_host else {}
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'upendra_store.sqlite3',
        }
    }



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 6}
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files configuration (WhiteNoise for production on Render)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": STATICFILES_STORAGE_BACKEND,
    },
}


# Media / Uploaded files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': None,
}

# Simple JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS Configuration
cors_origins_env = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if cors_origins_env:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins_env.split(',') if o.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]

# If CORS_ALLOW_ALL_ORIGINS is explicitly set in env or in local DEBUG mode
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('true', '1', 'yes') if not DEBUG else True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127.0.0.1:\d+$",
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.onrender\.com$",
]

# CSRF Trusted Origins
csrf_trusted_env = os.environ.get('CSRF_TRUSTED_ORIGINS', '')
if csrf_trusted_env:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in csrf_trusted_env.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://*.onrender.com',
        'https://*.vercel.app',
    ]


# Payment Gateway Configuration (Razorpay / Sandbox)
PAYMENT_GATEWAY = os.environ.get('PAYMENT_GATEWAY', 'razorpay')
PAYMENT_KEY_ID = os.environ.get('PAYMENT_KEY_ID', 'rzp_test_51b9eM8Lz5jM4h')
PAYMENT_KEY_SECRET = os.environ.get('PAYMENT_KEY_SECRET', 'sandbox_secret_key_upendra_2026')
PAYMENT_WEBHOOK_SECRET = os.environ.get('PAYMENT_WEBHOOK_SECRET', 'sandbox_webhook_secret_2026')

# Administrator Account Configuration (Configured securely via environment)
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '').strip()
ADMIN_MOBILE = os.environ.get('ADMIN_MOBILE', '').strip()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', '').strip()




