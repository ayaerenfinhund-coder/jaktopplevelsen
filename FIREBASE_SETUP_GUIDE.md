# Firebase Google Login Setup Guide - Complete Step-by-Step

This guide will walk you through setting up Firebase Authentication with Google Sign-In for JaktLogg.

## Prerequisites
- A Google account
- Node.js installed on your machine
- The JaktLogg project set up

---

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Click **"Add project"** or **"Create a project"**

2. **Name Your Project**
   - Project name: `jaktlogg` (or your preferred name)
   - Click **Continue**

3. **Google Analytics (Optional)**
   - You can disable Google Analytics for this project
   - Click **Continue** → **Create project**

4. **Wait for Project Creation**
   - Firebase will set up your project (takes ~30 seconds)
   - Click **Continue** when done

---

## Step 2: Register Your Web App

1. **Add Web App**
   - In your Firebase project dashboard, click the **web icon** (`</>`)
   - App nickname: `JaktLogg Web`
   - ✅ **Check** "Also set up Firebase Hosting" (optional)
   - Click **Register app**

2. **Copy Firebase Configuration**
   - You'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy.....................",
     authDomain: "jaktlogg-xxxxx.firebaseapp.com",
     projectId: "jaktlogg-xxxxx",
     storageBucket: "jaktlogg-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```
   - **SAVE THESE VALUES** - you'll need them later
   - Click **Continue to console**

---

## Step 3: Enable Google Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **Build** → **Authentication**
   - Click **Get started**

2. **Enable Google Sign-In Provider**
   - Click the **Sign-in method** tab
   - Click on **Google** in the providers list
   - Toggle **Enable** to ON
   - **Project public-facing name**: `JaktLogg`
   - **Project support email**: Select your email
   - Click **Save**

3. **Verify Provider is Enabled**
   - Google should now show as "Enabled" with a checkmark

---

## Step 4: Configure Authorized Domains

1. **Add Your Domains**
   - Still in Authentication, click **Settings** tab
   - Scroll to **Authorized domains**
   - Default domains included:
     - `localhost`
     - `jaktlogg-xxxxx.firebaseapp.com`
   - **Add your production domain** when you deploy (e.g., `jaktlogg.com`)

---

## Step 5: Set Up Environment Variables

1. **Create Environment File**
   - In your project root, create `.env.local`:
   ```bash
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Mapbox (get from https://mapbox.com)
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

2. **Replace Values**
   - Copy the values from Step 2 into this file
   - Replace each `your_*` placeholder with your actual Firebase config values

---

## Step 6: Set Up Mapbox (for Maps)

1. **Create Mapbox Account**
   - Go to [https://www.mapbox.com/](https://www.mapbox.com/)
   - Sign up for a free account

2. **Get Access Token**
   - After signing in, go to your **Account** page
   - Copy your **Default public token**
   - Add it to your `.env.local` file as `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Step 7: Configure Firestore Database (Optional - for cloud sync)

1. **Create Firestore Database**
   - In Firebase Console, click **Build** → **Firestore Database**
   - Click **Create database**
   - Select **Start in production mode**
   - Choose your location (e.g., `europe-west1` for Europe)
   - Click **Enable**

2. **Set Security Rules**
   - Click **Rules** tab
   - Replace with these rules for email-restricted access:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only allow authenticated users with specific emails
       function isAllowedUser() {
         return request.auth != null &&
                (request.auth.token.email == 'sandbergsimen90@gmail.com' ||
                 request.auth.token.email == 'w.geicke@gmail.com');
       }

       match /hunts/{huntId} {
         allow read, write: if isAllowedUser() &&
                              request.auth.uid == resource.data.userId;
         allow create: if isAllowedUser();
       }

       match /users/{userId} {
         allow read, write: if isAllowedUser() &&
                              request.auth.uid == userId;
       }
     }
   }
   ```
   - Click **Publish**

---

## Step 8: Configure Firebase Storage (Optional - for photos)

1. **Enable Storage**
   - In Firebase Console, click **Build** → **Storage**
   - Click **Get started**
   - Select **Start in production mode**
   - Click **Next** → **Done**

2. **Set Storage Rules**
   - Click **Rules** tab
   - Replace with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null &&
                              request.auth.uid == userId &&
                              (request.auth.token.email == 'sandbergsimen90@gmail.com' ||
                               request.auth.token.email == 'w.geicke@gmail.com');
       }
     }
   }
   ```
   - Click **Publish**

---

## Step 9: Install Dependencies & Run

1. **Install Project Dependencies**
   ```bash
   cd jaktopplevelsen
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test Login**
   - Open [http://localhost:3000](http://localhost:3000)
   - You should see the login page
   - Click "Logg inn med Google"
   - Sign in with either:
     - `sandbergsimen90@gmail.com`
     - `w.geicke@gmail.com`
   - Any other email will be rejected

---

## Step 10: Testing & Verification

### Test Checklist:
- [ ] Firebase project created successfully
- [ ] Google Auth provider enabled
- [ ] Environment variables set correctly
- [ ] Login page displays with logo
- [ ] Google sign-in popup appears
- [ ] Authorized user can log in
- [ ] Unauthorized user gets "Access denied" message
- [ ] User's first name appears in the app
- [ ] "Eier" badge shows for w.geicke@gmail.com

### Common Issues:

1. **"Firebase: No Firebase App" error**
   - Ensure `.env.local` file exists and has correct values
   - Restart the dev server after changing env vars

2. **"Google sign-in popup blocked"**
   - Allow popups for localhost in your browser
   - Try a different browser

3. **"Access denied" for correct email**
   - Check email is exactly matching in `lib/firebase.ts`
   - Emails are case-sensitive

4. **Map not loading**
   - Verify Mapbox token is correct
   - Check browser console for errors

---

## Security Notes

### Important Security Practices:

1. **Never commit `.env.local`**
   - This file is in `.gitignore`
   - Contains sensitive API keys

2. **Email Restriction**
   - Login is restricted at two levels:
     - Client-side in `lib/auth-context.tsx`
     - Server-side in Firestore/Storage rules

3. **Firebase Rules**
   - Always use production rules (not test mode)
   - Rules ensure only authorized users access data

4. **API Keys**
   - Firebase web API keys are meant to be public
   - Security comes from authentication and rules

---

## Deployment Checklist

When deploying to production:

1. **Add production domain** to Firebase Auth authorized domains
2. **Update OAuth consent screen** in Google Cloud Console
3. **Set environment variables** on your hosting platform
4. **Enable billing** if expecting high traffic (free tier is generous)
5. **Monitor usage** in Firebase Console

---

## Quick Reference

### File Locations:
- Firebase config: `lib/firebase.ts`
- Auth context: `lib/auth-context.tsx`
- Login page: `app/login/page.tsx`
- Environment variables: `.env.local`

### Allowed Users:
```typescript
export const ALLOWED_EMAILS = [
  'sandbergsimen90@gmail.com',  // Developer
  'w.geicke@gmail.com',         // Primary User (Wilfred)
]

export const PRIMARY_USER_EMAIL = 'w.geicke@gmail.com'
```

### To Add More Users:
1. Add email to `ALLOWED_EMAILS` array in `lib/firebase.ts`
2. Update Firestore rules
3. Update Storage rules

---

## Support

- Firebase Documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Next.js Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Mapbox Documentation: [https://docs.mapbox.com/](https://docs.mapbox.com/)

---

**Setup Complete!** 🎉

The app will now only allow login from the two authorized email addresses, with Wilfred appearing as the owner of the app.
