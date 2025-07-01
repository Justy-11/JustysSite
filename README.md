# CreatiMate

## ⚙️ Requirements

- **Python**: 3.12.0 (Used)
- **Node.js** 
- **PostgreSQL**
- **Git**
---

## 🐍 Backend Setup (Django)

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd backend

2. **Create and activate a virtual environment:**
   ```bash
    py -m venv .venv
    source .venv/Scripts/activate  # On Windows
    # source .venv/bin/activate    # On macOS/Linux

3. **Install dependencies:**
   ```bash
    pip install -r requirements.txt

4. **Create a .env file inside backend/**
    ```bash
    SECRET_KEY=your-secret-key-here
    DEBUG=True

    DB_NAME=justys_db
    DB_USER=postgres
    DB_PASSWORD=YourDBPassword
    DB_HOST=localhost
    DB_PORT=5432

    EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
    EMAIL_HOST=smtp.gmail.com
    EMAIL_PORT=587
    EMAIL_USE_TLS=True
    EMAIL_HOST_USER=YourEmail
    EMAIL_HOST_PASSWORD=YourHostPassword
    DEFAULT_FROM_EMAIL=YourEmail

    FRONTEND_URL=http://localhost:5173

    GOOGLE_CLIENT_ID=YourClientID
    GOOGLE_CLIENT_SECRET=YourClientSecret

## ✉️ Email Verification with Gmail
To use Gmail SMTP, you need to generate an App Password:

Steps:
- Enable 2-Step Verification in your Google Account:
https://myaccount.google.com/security
- Go to: https://myaccount.google.com/apppasswords
- App: Mail
- Device: Django (or anything)
- Google will generate a 16-digit App Password
- Use this as EMAIL_HOST_PASSWORD in your .env file.

5. **Run database migrations:**
   ```bash
    cd JustysProject
    py manage.py makemigrations
    py manage.py migrate

6. **Create a superuser:**
   ```bash
    py manage.py createsuperuser

7. **Start the Django development server:**
   ```bash
    py manage.py runserver

## 🔐 Configure Google Login (Django AllAuth)
Log in to Django Admin
Go to http://localhost:8000/admin/
Use your superuser credentials.

Add a Social Application:
- Go to Social Accounts > Social Applications
- Click Add
- Provider: Google
- Name: Google
- Enter Client ID and Secret Key (instructions below)

## Get Client ID and Secret from Google Cloud:

- Go to https://console.cloud.google.com , Create or select a project
- Navigate to APIs & Services > Credentials
- Click Create Credentials > OAuth 2.0 Client IDs
- App type: Web application
- Add this Redirect URI: http://localhost:8000/accounts/google/login/callback

## ⚛️ Frontend Setup (React + Vite)

1. **Navigate to frontend folder:**
   ```bash
   cd frontend

2. **Navigate to frontend folder:**
   ```bash
   npm install

3. **Create a .env file inside frontend/:**
   ```bash
   VITE_API_URL="http://localhost:8000"
   VITE_GOOGLE_CLIENT_ID=YourClientID
   VITE_TINYMCE_API_KEY=YourTinyMCEAPIKey

   Create account and get the API key: https://www.tiny.cloud/auth/login/

4. **Start the frontend dev server:**
   ```bash
   npm run dev

5. **Visit the registration page:**
   http://localhost:5173/register

