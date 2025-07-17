# CreatiMate

A no-code platform that empowers users to create and customize their own branded product/service pages and full websites.

## 🚀 Main Features & Functions

- **User Authentication**
  - Register with email/password and email verification (OTP)
  - Login with email/password or Google OAuth
  - Secure JWT-based authentication with HTTP-only cookies
  - "Remember Me" for persistent login
  - Password reset via email

- **Profile Management**
  - View and update user profile details (email, username, phone, address, currency, social links)

- **Page & Website Builder**
  - Create and update a personal or business page
  - Add profile and banner images, product name, tagline, about, contact info
  - Publish/unpublish your page

- **Product Management**
  - Add, edit, and delete products (title, description, price, stock, image)
  - Bulk add products via CSV and ZIP upload
  - Organize products into collections

- **Collections**
  - Create, update, and delete product collections
  - View products by collection

- **Public Pages**
  - Shareable public product/service pages
  - Publicly viewable collections and products

- **Security**
  - All authentication is handled via JWT tokens stored in HTTP-only cookies
  - Automatic access token refresh using refresh tokens (also in HTTP-only cookies)
  - CORS and CSRF protection configured for secure cross-origin requests

## 🔒 How JWT + HTTP-only Cookies Provide Security

- **HTTP-only cookies** prevent JavaScript access to tokens, protecting against XSS attacks.
- **JWT tokens** are signed and have short lifetimes, so even if intercepted, they can't be tampered with or used for long.
- **Refresh tokens** are also stored in HTTP-only cookies, allowing seamless, secure token renewal without exposing tokens to the frontend.
- **No sessionid or CSRF tokens** are needed for API authentication, reducing attack surface.
- **Automatic token refresh** ensures users stay logged in securely, but are logged out if both tokens expire.

## 🚀 Getting Started

### ⚙️ Requirements

- **Python**: 3.12.0 (Used)
- **Node.js** 
- **PostgreSQL**
- **Git**
---

### 🐍 Backend Setup (Django)

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

### ✉️ Email Verification with Gmail
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

### 🔐 Configure Google Login (Django AllAuth)
Log in to Django Admin
Go to http://localhost:8000/admin/
Use your superuser credentials.

Add a Social Application:
- Go to Social Accounts > Social Applications
- Click Add
- Provider: Google
- Name: Google
- Enter Client ID and Secret Key (instructions below)

### Get Client ID and Secret from Google Cloud:

- Go to https://console.cloud.google.com , Create or select a project
- Navigate to APIs & Services > Credentials
- Click Create Credentials > OAuth 2.0 Client IDs
- App type: Web application
- Add this Redirect URI: http://localhost:8000/accounts/google/login/callback

### ⚛️ Frontend Setup (React + Vite)

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

4. **Start the frontend dev server:**
   ```bash
   npm run dev

5. **Visit the registration page:**
   http://localhost:5173/register

---

## 🏭 Production Settings

### Key Differences from Local Development

- **Image URLs:**  
  All image fields returned by the backend now provide public URLs (e.g., `profile_image_url`, `banner_image_url`, `image_url`).  
  Update your frontend to use these fields in all relevant components and pages.

- **S3 Storage:**  
  The backend is configured (monkey-patched) to use S3 as the default storage for media files in production.

- **Token Refresh:**  
  On every token refresh, a new refresh token is issued (with the same expiration time). This is because refresh tokens are blacklisted after use for enhanced security.

---

### Example Production Environment Variables (`.env.prod`)

```env
# Django Settings
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-production-domain.com,www.your-production-domain.com

# Database Settings
DB_NAME=your_prod_db_name
DB_USER=your_prod_db_user
DB_PASSWORD=your_prod_db_password
DB_HOST=your_prod_db_host
DB_PORT=5432

# Frontend URL
FRONTEND_URL=https://your-production-frontend.com

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-production-email@gmail.com
EMAIL_HOST_PASSWORD=your-production-app-password
DEFAULT_FROM_EMAIL=your-production-email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# S3 Storage (example, add your actual keys and bucket)
SUPABASE_S3_ACCESS_KEY=your-s3-access-key
SUPABASE_S3_SECRET_KEY=your-s3-secret-key
SUPABASE_BUCKET_NAME=media
SUPABASE_S3_ENDPOINT_URL=your-s3-endpoint-url
SUPABASE_PUBLIC_URL=your-public-url
```

