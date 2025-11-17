# JaktLogg - Din Digitale Jaktopplevelse

A modern, offline-first hunting tracking application built with Next.js 14, featuring GPS tracking, photo documentation, flythrough animations, and comprehensive export capabilities.

## Features

### 🗺️ Interactive Maps
- **Flythrough Mode**: Animate camera along hunt paths like a drone video
- **GPS Path Tracking**: Real-time location tracking with high accuracy
- **Photo Markers**: Thumbnail previews at exact GPS locations
- **Offline Maps**: Pre-downloaded map tiles for hunting areas

### 📱 Mobile-First Design
- **PWA Support**: Install as a native-like app
- **Responsive UI**: Optimized for mobile devices
- **Touch-friendly**: Smooth interactions and gestures
- **Safe Area Support**: Proper handling of device notches

### 📴 Offline-First Architecture
- **Works Without Signal**: Critical for remote hunting areas
- **Auto-Sync**: Automatic synchronization when connection returns
- **IndexedDB Storage**: Local data persistence
- **Photo Queue**: Queue photos for later upload

### 📊 Export & Reports
- **PDF Reports**: Beautiful reports with maps and statistics
- **Share Cards**: Visual summary cards for sharing
- **Instagram-Ready**: 1080x1080 optimized images
- **Season Summaries**: Comprehensive season statistics

### ✨ Micro-Interactions
- **Haptic Feedback**: Tactile response on important actions
- **Smooth Animations**: Framer Motion powered transitions
- **Visual Feedback**: Satisfying save and sync animations
- **60fps Scrolling**: Buttery smooth performance

### 🔒 Security
- **Google OAuth**: Secure authentication
- **Email Restrictions**: Only authorized users can access
- **Firebase Rules**: Server-side data protection
- **No Data Leaks**: Proper handling of sensitive information

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (optional cloud sync)
- **Storage**: IndexedDB (offline-first)
- **Animations**: Framer Motion
- **PDF Generation**: jsPDF
- **Image Processing**: html2canvas

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (for authentication)
- Mapbox account (for maps)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jaktopplevelsen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your Firebase and Mapbox credentials.

4. **Configure Firebase**

   Follow the detailed guide in `FIREBASE_SETUP_GUIDE.md`

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Authorized Users

Edit `lib/firebase.ts` to modify allowed users:

```typescript
export const ALLOWED_EMAILS = [
  'sandbergsimen90@gmail.com',
  'w.geicke@gmail.com',
]

export const PRIMARY_USER_EMAIL = 'w.geicke@gmail.com'
```

### Map Settings

The app uses Mapbox's outdoors style by default. You can customize the map style in `components/MapView.tsx`.

## Project Structure

```
jaktopplevelsen/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard
│   ├── login/             # Login page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── MapView.tsx        # Map with flythrough
│   ├── Dashboard.tsx      # Main dashboard
│   ├── BottomNav.tsx      # Navigation
│   ├── ExportModal.tsx    # Export functionality
│   └── ...
├── lib/                   # Utilities and contexts
│   ├── firebase.ts        # Firebase configuration
│   ├── auth-context.tsx   # Authentication state
│   └── offline-context.tsx # Offline data management
├── public/                # Static assets
│   ├── logo.png          # App logo
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
└── FIREBASE_SETUP_GUIDE.md # Detailed setup guide
```

## Performance Optimizations

- **Instant Page Loads**: Server-side rendering with Next.js
- **Optimistic Updates**: Immediate UI feedback
- **Lazy Loading**: Images loaded on demand with blur placeholders
- **Code Splitting**: Automatic chunk optimization
- **Service Worker**: Background caching and sync

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted with Node.js

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

Private project - All rights reserved

## Support

For issues and feature requests, please contact the development team.

---

Built with ❤️ for Norwegian hunters
