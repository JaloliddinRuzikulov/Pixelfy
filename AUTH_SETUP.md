# Authentication System Setup Guide

This guide will help you set up the complete user authentication system for the React Video Editor.

## 🔧 Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running. You can use:
   - Local PostgreSQL installation
   - Docker PostgreSQL container
   - Cloud services like Railway, Supabase, or Neon

2. **Node.js**: Version 18+ required for the application

## 🚀 Setup Instructions

### 1. Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set the following required variables:

   ```env
   # Authentication (REQUIRED)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Database (REQUIRED)
   DATABASE_URL=postgresql://username:password@localhost:5432/video_editor

   # Optional but recommended
   PEXELS_API_KEY=your_pexels_api_key_here
   GOOGLE_AI_API_KEY=your_google_ai_key_here
   ```

   **Important**:
   - Use a strong, unique JWT_SECRET in production
   - Replace database credentials with your actual PostgreSQL connection details

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Run the authentication setup script:

```bash
npm run setup-auth
```

This script will:
- Test your database connection
- Create all necessary tables (users, sessions, projects, etc.)
- Set up indexes and triggers
- Verify the setup

### 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your video editor with authentication!

## 📚 Using the Authentication System

### User Registration

1. Go to `/auth/register`
2. Fill in the registration form
3. An account will be created (email verification tokens are logged to console in development)

### User Login

1. Go to `/auth/login`
2. Enter your credentials
3. You'll be redirected to the video editor

### Protected Routes

The following routes require authentication:
- `/edit` - Video editor (main application)
- `/dashboard` - User dashboard (if implemented)
- `/projects` - Project management (if implemented)

Unauthenticated users will be redirected to `/auth/login`.

### User Interface

- **Navbar**: Shows user menu when authenticated, "Sign In" button when not
- **User Menu**: Provides access to profile, settings, and logout functionality

## 🎛️ API Endpoints

The authentication system provides these API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify-email` - Email verification

## 🗄️ Database Schema

The system creates these tables:

- **users**: User accounts with email, password, profile info
- **sessions**: Active user sessions for authentication
- **projects**: User projects (linked to users)
- **email_verification_tokens**: Email verification tokens
- **password_reset_tokens**: Password reset tokens

## 🔒 Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds
- **JWT Sessions**: Secure session management
- **Session Expiry**: 7-day session expiration
- **Email Verification**: Token-based email verification
- **Password Requirements**: Strong password validation
- **Middleware Protection**: Route-level authentication
- **CSRF Protection**: Secure cookies with proper flags

## 🎨 UI Components

Pre-built components included:

- `LoginForm`: Complete login form with validation
- `RegisterForm`: Registration form with password strength indicator
- `UserMenu`: User dropdown with profile options
- `ProtectedRoute`: Client-side route protection component

## 🔧 Customization

### Adding Custom Fields

To add custom user fields:

1. Update the database schema in `scripts/auth-migration.sql`
2. Update the `User` interface in `src/lib/auth.ts`
3. Update the repository methods in `src/lib/db.ts`
4. Update the registration form and API

### Email Service Integration

To add email sending (currently logged to console):

1. Choose an email service (SendGrid, AWS SES, etc.)
2. Update the registration API in `src/app/api/auth/register/route.ts`
3. Add email templates and sending logic

### Social Authentication

To add social login (Google, GitHub, etc.):

1. Install relevant auth libraries
2. Add OAuth API routes
3. Update the login forms with social buttons
4. Handle OAuth callbacks

## 🚨 Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall settings for remote databases

### JWT Errors

- Ensure `JWT_SECRET` is set and consistent
- Clear cookies if you changed the secret

### Session Issues

- Check browser cookies are enabled
- Verify middleware is properly configured
- Check session expiry in database

### Build Errors

- Run `npm run lint` to check for TypeScript errors
- Ensure all required dependencies are installed
- Check for React 19 compatibility issues

## 🎯 Next Steps

After setup, you can:

1. **Customize the UI**: Update forms, colors, and branding
2. **Add Features**: Implement password reset, email verification
3. **User Dashboard**: Create user dashboard and project management
4. **Admin Panel**: Add admin functionality for user management
5. **Analytics**: Track user engagement and usage
6. **Email Service**: Integrate proper email sending
7. **Social Auth**: Add Google/GitHub login options

## 💡 Tips

- Test the authentication flow thoroughly
- Use environment variables for all secrets
- Implement proper error handling
- Add logging for security events
- Consider rate limiting for auth endpoints
- Regularly clean up expired sessions and tokens

Your authentication system is now ready! Users can register, log in, and access the video editor with full user management capabilities.
