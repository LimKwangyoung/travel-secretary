from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()  # .env 파일 로드

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-@jqma=hcfuz_zka-lqi(=)r9d1!zgo@74p_h%x@n*_joy)c63u'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'j11a204.p.ssafy.io', 'back-backend-1', '13.124.201.222']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'corsheaders', 
    'social_django', 
    'accounts', 
    'bank_accounts', 
    'trips',
    'payments', 
    'keys', 
]

MIDDLEWARE = [
    # 'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'social_django.middleware.SocialAuthExceptionMiddleware', 
]


# CSRF 보호 비활성화
CSRF_TRUSTED_ORIGINS = ['http://127.0.0.1:8000', 'http://52.79.246.151:80', 'http://127.0.0.1:5173']

SITE_ID = 1

ROOT_URLCONF = 'back.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'back.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'ko-kr'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_TZ = True

USE_TZ = False

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}
CORS_ORIGIN_ALLOW_ALL = True  # 모든 도메인에 대해 허용
CORS_ALLOW_CREDENTIALS = True

# HTTPS 관련 세팅
# SECURE_SSL_REDIRECT = True

# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True

# SECURE_HSTS_SECONDS = 3600
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True
# SECURE_HSTS_PRELOAD = True

# SECURE_BROWSER_XSS_FILTER = True
# SECURE_CONTENT_TYPE_NOSNIFF = True

# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ChatGPT API KEY
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

AUTHENTICATION_BACKENDS = (
    # 'django.contrib.auth.backends.ModelBackend',
    'social_core.backends.kakao.KakaoOAuth2',
)

SOCIAL_AUTH_KAKAO_KEY = os.getenv('SOCIAL_AUTH_KAKAO_KEY')
SOCIAL_AUTH_KAKAO_SECRET = os.getenv('SOCIAL_AUTH_KAKAO_SECRET')
SOCIAL_AUTH_KAKAO_SCOPE = ['profile_nickname', 'profile_image', 'friends', 'talk_message']


if os.getenv('DJANGO_ENV') == 'production':
    SOCIAL_AUTH_KAKAO_REDIRECT_URI = 'http://j11a204.p.ssafy.io/api/auth/complete/kakao/'
    SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://j11a204.p.ssafy.io/kakao_callback'
    # SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://localhost:5173/kakao_callback'
else:  # local
    SOCIAL_AUTH_KAKAO_REDIRECT_URI = 'http://127.0.0.1:8000/api/auth/complete/kakao/'
    # SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://j11a204.p.ssafy.io/kakao_callback'
    SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://localhost:5173/kakao_callback'

