# EasyIn Pro - Professional Invoicing & Inventory

EasyIn Pro is a high-performance, local-first invoicing and inventory management application designed for small businesses. It features AI-powered business advisory, unit conversion tools, and cloud-based backup/restore via Google Drive and Microsoft OneDrive.

## 🚀 Deployment Guide (Option 3: Manual Hosting)

This app is a static Single Page Application (SPA) built with React, Vite, and Tailwind CSS. It can be hosted on any static site hosting provider.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### 2. Local Setup
```bash
# Install dependencies
npm install

# Create a .env file based on .env.example
cp .env.example .env

# Run development server
npm run dev
```

### 3. Build for Production
```bash
# Generate static files in the /dist folder
npm run build
```

### 4. Hosting Options

#### Netlify (Recommended)
1.  **Export to GitHub**: Use the AI Studio "Export to GitHub" feature.
2.  **Connect to Netlify**: Link your GitHub repository.
3.  **Build Settings**:
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `dist`
4.  **Environment Variables**: Set the following in your Netlify dashboard:
    -   `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
    -   `VITE_ONEDRIVE_CLIENT_ID`: Your Microsoft Azure Client ID.
    -   `GEMINI_API_KEY`: Your Google Gemini API key.

### 5. Deployment via CLI
You can also deploy directly from your terminal using the Netlify CLI:
```bash
# 1. Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# 2. Build the app
npm run build

# 3. Deploy to production
npm run deploy
```

## ☁️ Cloud Configuration

### Google Drive Sync
- **Authorized JavaScript Origins**: Add your production URL (e.g., `https://your-app.vercel.app`).
- **Scopes**: `https://www.googleapis.com/auth/drive.file`

### Microsoft OneDrive Sync
- **Redirect URIs**: Add your production URL as a **Single-page application (SPA)**.
- **Scopes**: `Files.ReadWrite`, `User.Read`

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF, jsPDF-AutoTable
- **AI**: Google Gemini (via @google/genai)
- **Cloud Sync**: Google Drive API, Microsoft Graph API (MSAL)

---
*Built with Google AI Studio Build*
