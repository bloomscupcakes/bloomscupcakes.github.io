# Blooms Cupcakes

A beautiful, responsive cupcake ordering website built with React, Vite, and Firebase.

## Features

- 🧁 Interactive cupcake catalog with multiple flavors and sizes
- 🛒 Shopping cart with persistent storage
- 📱 Mobile-responsive design with dark mode support
- 🎨 Smooth animations with Framer Motion
- 📊 Google Analytics integration
- 🔥 Firebase backend for order management
- 💳 Inquiry-based ordering system

## Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bloomscupcakes
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Analytics & Ads
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
VITE_ADS_ID=your_ads_conversion_id
```

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Get your Firebase config from Project Settings > General > Your apps
4. Add the config values to your `.env` file

### Google Analytics Setup

1. Create a Google Analytics 4 property
2. Get your Measurement ID (starts with G-)
3. Add it to `VITE_GA_MEASUREMENT_ID` in your `.env` file

## Development

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deployment

### Option 1: Manual Deployment (Current)

```bash
npm run deploy
```

This builds the app with your local `.env` values and deploys to GitHub Pages.

### Option 2: Automated Deployment with GitHub Actions (Recommended for Production)

1. **Set up GitHub Secrets:**
   Go to your repository Settings → Secrets and variables → Actions
   Add these secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_GA_MEASUREMENT_ID`
   - `VITE_ADS_ID`

2. **Enable GitHub Pages:**
   Go to Settings → Pages
   Set source to "GitHub Actions"

3. **Push to main branch:**
   The workflow will automatically build and deploy with production secrets.

### Environment Variables in Production

**Manual Deploy:** Uses your local `.env` file values
**GitHub Actions:** Uses repository secrets (recommended for production)

Both methods bake the environment variables into the build at compile time.

## Firebase Document Structure

Orders are stored in Firestore with custom document IDs following this format:
```
YYYYMMDD_username_XXXX
```

Where:
- `YYYYMMDD`: Current date (e.g., 20260420)
- `username`: Sanitized customer name (lowercase, alphanumeric, max 10 chars)
- `XXXX`: Last 4 digits of timestamp for uniqueness

**Example document IDs:**
- `20260420_johndoe_1234`
- `20260420_marysmith_5678`
- `20260420_alexjohnso_9012`

This naming convention makes orders easily searchable and sortable by date and customer name.

**Note:** If two orders are submitted with the same name at the exact same millisecond, the timestamp ensures uniqueness. In extremely rare cases of collision, Firestore will handle the conflict gracefully.

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore)
- **Analytics**: Google Analytics 4
- **Deployment**: GitHub Pages
