
# 🚀 EasyIn Setup & Node.js Commands

If you are seeing a **blank screen**, it's because the computer needs to "translate" the React code (TSX) into plain JavaScript.

---

## 💻 1. How to Run Locally (Node.js)

Open your terminal in this project folder and run these commands in order:

### Step A: Install Node.js
If you haven't already, download and install Node.js from [nodejs.org](https://nodejs.org).

### Step B: Install the environment
```bash
npm install
```

### Step C: Run the Application
```bash
npm start
```

---

## 🛠️ 2. Fixing the "Blank Screen" (Vite Method)

For the best experience and to ensure the code renders correctly on your PC, we recommend using **Vite**.

1.  **Install Vite**:
    ```bash
    npm install -g vite
    ```
2.  **Run Development Server**:
    ```bash
    vite
    ```
3.  **Open the Link**: It will give you a link like `http://localhost:5173`. Open this in your browser.

---

## 📦 3. Create Windows Installer (.exe)

Once you are ready to use it as a real desktop app:
```bash
npm run build
```
This will generate a `dist` folder containing `EasyIn Invoicing Setup.exe`.

---

## 📂 4. Project Structure
- `index.html`: The entry point.
- `index.tsx`: The logic that starts React.
- `App.tsx`: The main application code.
- `main.js`: Tells Electron how to open the window.
- `package.json`: Contains the commands and library list.
