# Firebase Authentication Setup

This project now uses Firebase Authentication for user login and signup. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "vigyaan-project")
4. Follow the setup wizard (you can disable Google Analytics if not needed)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project console, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## 3. Get Your Firebase Configuration

1. In your Firebase project console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "vigyaan-web")
6. Copy the Firebase configuration object

## 4. Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables with your Firebase configuration values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 5. Test the Setup

1. Run your development server: `npm run dev`
2. Navigate to `/login`
3. Try creating a new account or logging in with existing credentials
4. You should be redirected to the map page after successful authentication

## Features

- ✅ User registration and login
- ✅ Email/password authentication
- ✅ Protected routes (map page requires authentication)
- ✅ User logout functionality
- ✅ User information display
- ✅ Automatic redirect to login for unauthenticated users

## Security Notes

- Never commit your `.env.local` file to version control
- The Firebase configuration uses `NEXT_PUBLIC_` prefix because it needs to be accessible on the client side
- Firebase handles password hashing and security automatically
- User sessions are managed by Firebase Authentication

## Troubleshooting

If you encounter issues:

1. Make sure all environment variables are set correctly
2. Check that Firebase Authentication is enabled for Email/Password
3. Verify your Firebase project configuration
4. Check the browser console for any error messages
5. Ensure you're using the latest version of Firebase SDK 