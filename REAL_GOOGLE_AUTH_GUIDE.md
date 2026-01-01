# How to Implement Real Google Sign-In for EcoShare

To replace the simulated login with real Google Authentication, follow these steps.

## Phase 1: Google Cloud Setup

1.  Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2.  Create a **New Project** (e.g., "EcoShare").
3.  Navigate to **APIs & Services > Credentials**.
4.  Click **Create Credentials > OAuth client ID**.
5.  **Configure Consent Screen** (if asked):
    *   User Type: External
    *   App Name: EcoShare
    *   Support Email: Your email
6.  **Create OAuth Client ID**:
    *   Application Type: **Web application**
    *   Authorized JavaScript Origins: `http://localhost:5173`
    *   Authorized Redirect URIs: `http://localhost:5173`
7.  **Copy your Client ID**. It looks like: `123456...apps.googleusercontent.com`.

## Phase 2: Frontend Implementation

1.  **Install the Library**:
    ```bash
    npm install @react-oauth/google jwt-decode
    ```

2.  **Update `src/main.jsx`**:
    Wrap your app in the GoogleOAuthProvider.
    ```jsx
    import { GoogleOAuthProvider } from '@react-oauth/google';

    // ... inside render
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
    ```

3.  **Update `src/auth/Login.jsx`**:
    Replace the custom button with the official component.
    ```jsx
    import { GoogleLogin } from '@react-oauth/google';
    import { jwtDecode } from "jwt-decode";
    
    // ... inside component
    <GoogleLogin
      onSuccess={credentialResponse => {
        const decoded = jwtDecode(credentialResponse.credential);
        
        // Call your backend with the user details
        const userPayload = {
            name: decoded.name,
            email: decoded.email,
            photoUrl: decoded.picture
        };
        handleRealGoogleLogin(userPayload); 
      }}
      onError={() => {
        console.log('Login Failed');
      }}
    />
    ```

## Phase 3: Backend Security (Optional but Recommended)

Currently, the backend trusts the email sent by the frontend. For production security:

1.  **Install Library**: `npm install google-auth-library` in `server/` folder.
2.  **Update `server/index.js`**:
    *   Receive the `credential` (token) instead of raw user details.
    *   Verify the token using `google-auth-library`.
    *   Extract email from the verified token.

This ensures no one can spoof a login by just sending a fake email to your API.
