# ERP · CRM — Setup Guide

## 📁 Final File Structure

```
my-erp/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.js
    └── firebase-config.js   ← paste your config here
```

---

## 🔥 Step 1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → give it a name → Continue
3. Disable Google Analytics (optional) → **Create project**

---

## 🔐 Step 2 — Enable Authentication

1. In your Firebase project, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in providers**, enable **Email/Password**
4. Click **Save**

---

## 🗄️ Step 3 — Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Start in **test mode** (you can add security rules later)
4. Choose your region → **Enable**

---

## ⚙️ Step 4 — Get Your Firebase Config

1. Go to **Project Settings** (gear icon, top left)
2. Scroll down to **"Your apps"**
3. Click **"</> Web"** → register the app (give it any nickname)
4. Copy the `firebaseConfig` object
5. Open `src/firebase-config.js` and paste it in

**Example:**
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-erp.firebaseapp.com",
  projectId: "my-erp",
  storageBucket: "my-erp.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:123:web:abc123",
};
```

---

## 👤 Step 5 — Create Your First Admin User

### 5a. Create the auth account:
1. Firebase Console → **Authentication → Users**
2. Click **"Add user"**
3. Enter email + password
4. Click **Add user** → **copy the UID** shown in the table

### 5b. Register their profile in Firestore:
1. Firebase Console → **Firestore → Start collection**
2. Collection ID: `users`
3. Add a document with these fields:
   ```
   uid        (string)  →  paste the UID from step 5a
   email      (string)  →  the user's email
   name       (string)  →  e.g. "Admin User"
   role       (string)  →  admin
   ```
4. Click **Save**

> ✅ After this, the admin can log in and create more users from the **Users** tab inside the app.

---

## 🔒 Step 6 — Firestore Security Rules (Recommended)

In Firebase Console → **Firestore → Rules**, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows any authenticated user to read/write. The role enforcement happens in the app UI.

---

## 🚀 Step 7 — Run Locally

```bash
# 1. Create project folder
mkdir my-erp && cd my-erp

# 2. Create src folder
mkdir src

# 3. Copy all files into place:
#    index.html       → my-erp/index.html
#    package.json     → my-erp/package.json
#    vite.config.js   → my-erp/vite.config.js
#    main.jsx         → my-erp/src/main.jsx
#    App.js           → my-erp/src/App.js
#    firebase-config.js → my-erp/src/firebase-config.js

# 4. Install dependencies
npm install

# 5. Start the dev server
npm run dev

# 6. Open in browser
# → http://localhost:5173
```

---

## 🎯 Role Permissions Summary

| Feature         | Admin | Inventory | Sales | Accountant |
|----------------|-------|-----------|-------|------------|
| Dashboard       | ✅    | ❌        | ❌    | ❌         |
| Inventory (view)| ✅    | ✅        | ❌    | ❌         |
| Inventory (edit)| ✅    | ✅        | ❌    | ❌         |
| Bookings (view) | ✅    | ❌        | ✅    | ✅         |
| Bookings (create)| ✅   | ❌        | ✅    | ❌         |
| Accounting      | ✅    | ❌        | ❌    | ✅         |
| Users           | ✅    | ❌        | ❌    | ❌         |

---

## 🗃️ Firestore Collections Used

| Collection     | Purpose                          |
|---------------|----------------------------------|
| `users`        | User profiles + roles            |
| `inventory`    | Products (name, qty, status)     |
| `bookings`     | Client bookings with date ranges |
| `transactions` | Income records per booking       |

---

## 🏗️ To Deploy (Optional)

```bash
npm run build
# Then upload the dist/ folder to Firebase Hosting, Vercel, or Netlify
```

For Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # choose dist as public dir
firebase deploy
```
