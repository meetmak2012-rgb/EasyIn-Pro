
# 🚀 EasyIn Setup & Node.js Commands

This is a React-based web application for professional invoicing and inventory management.

---

## 💻 1. How to Run Locally

Open your terminal in this project folder and run these commands in order:

### Step A: Install Node.js
If you haven't already, download and install Node.js from [nodejs.org](https://nodejs.org).

### Step B: Install the environment
```bash
npm install
```

### Step C: Run the Application
```bash
npm run dev
```
This will start the development server. Open the link (usually `http://localhost:3000`) in your browser.

---

## 📦 2. Build for Production

To create a production-ready build:
```bash
npm run build
```
This will generate a `dist` folder containing the static files that can be deployed to any web host (Vercel, Netlify, etc.).

---

## 📂 3. Project Structure
- `index.html`: The entry point.
- `src/index.tsx`: The logic that starts React.
- `src/App.tsx`: The main application code.
- `package.json`: Contains the commands and library list.
- `vite.config.ts`: Vite configuration.
