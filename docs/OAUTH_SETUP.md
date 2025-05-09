# OAuth Setup Guide for Green University Hospital

This guide explains how to set up OAuth authentication for the Green University Hospital Management System.

## Prerequisites

- A Google Cloud Platform account
- A Facebook Developer account
- An Apple Developer account (for Apple Sign-In)
- Your application running on a domain or localhost

## Google OAuth Setup

1. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: "Green University Hospital"
     - User support email: Your email
     - Developer contact information: Your email
   - Add the necessary scopes:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
   - Add test users if you're in testing mode

3. **Create OAuth Client ID**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add a name for your client (e.g., "Green University Hospital Web Client")
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (e.g., `https://hospital.example.com`)
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - Your production callback URL (e.g., `https://hospital.example.com/api/auth/google/callback`)
   - Click "Create"

4. **Update Your Environment Variables**:
   - Copy the Client ID and Client Secret
   - Update your backend `.env` file with these values:
     ```
     GOOGLE_CLIENT_ID=your_client_id_here
     GOOGLE_CLIENT_SECRET=your_client_secret_here
     ```

## Facebook OAuth Setup

1. **Create a Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "My Apps" > "Create App"
   - Select "Consumer" as the app type
   - Fill in the app name "Green University Hospital" and contact email
   - Click "Create App"

2. **Set Up Facebook Login**:
   - From your app dashboard, click "Add Product"
   - Select "Facebook Login" and choose "Web"
   - Enter your website URL (e.g., `http://localhost:5173` for development)
   - Skip the quick start

3. **Configure Facebook Login Settings**:
   - Go to "Facebook Login" > "Settings"
   - Add the following OAuth Redirect URIs:
     - `http://localhost:5000/api/auth/facebook/callback` (for development)
     - Your production callback URL (e.g., `https://hospital.example.com/api/auth/facebook/callback`)
   - Save changes

4. **Get App ID and Secret**:
   - Go to "Settings" > "Basic"
   - Copy the App ID and App Secret
   - Update your backend `.env` file:
     ```
     FACEBOOK_APP_ID=your_app_id_here
     FACEBOOK_APP_SECRET=your_app_secret_here
     ```

## Apple Sign-In Setup

1. **Enroll in the Apple Developer Program**:
   - You need an Apple Developer account ($99/year)

2. **Configure Your App ID**:
   - Go to [Apple Developer Portal](https://developer.apple.com/)
   - Navigate to "Certificates, IDs & Profiles"
   - Create a new App ID with "Sign In with Apple" capability

3. **Create a Services ID**:
   - In the same section, create a Services ID
   - Configure the "Sign In with Apple" settings
   - Add domains and return URLs:
     - Domain: `localhost` (for development) or your domain
     - Return URL: `http://localhost:5000/api/auth/apple/callback` (for development) or your production callback

4. **Create a Key**:
   - In "Certificates, IDs & Profiles", create a new key
   - Enable "Sign In with Apple"
   - Configure the key with your Primary App ID
   - Download the key (a .p8 file)

5. **Update Environment Variables**:
   - Update your backend `.env` file:
     ```
     APPLE_CLIENT_ID=your_services_id
     APPLE_TEAM_ID=your_team_id
     APPLE_KEY_ID=your_key_id
     APPLE_PRIVATE_KEY_LOCATION=path/to/your/AuthKey_KEYID.p8
     ```

## Enabling OAuth in the Application

Once you've set up all the OAuth providers and updated your environment variables, you need to uncomment the OAuth redirect code in the frontend:

1. **In Login.jsx**:
   ```javascript
   const handleGoogleLogin = () => {
     window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=patient`;
   };
   
   const handleAppleLogin = () => {
     window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple?role=patient`;
   };
   
   const handleFacebookLogin = () => {
     window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook?role=patient`;
   };
   ```

2. **In Register.jsx**:
   ```javascript
   const handleGoogleRegister = () => {
     window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=${formData.role}`;
   };
   
   const handleAppleRegister = () => {
     window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple?role=${formData.role}`;
   };
   
   const handleFacebookRegister = () => {
     window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook?role=${formData.role}`;
   };
   ```

## Testing OAuth Integration

After setting up the OAuth providers and updating your code:

1. Restart your backend and frontend servers
2. Try logging in with each provider
3. Check the server logs for any errors
4. Verify that user accounts are created correctly in your database

## Troubleshooting

- **"The OAuth client was not found" error**: Verify your Client ID is correct and the application is properly configured in the Google Cloud Console.
- **"Invalid redirect URI" error**: Make sure the redirect URI in your code exactly matches what you configured in the provider's developer console.
- **"Invalid client secret" error**: Double-check your client secret in the .env file.
- **CORS errors**: Ensure your API server is properly handling CORS and that the origins are correctly configured.
