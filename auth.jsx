import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase-config";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  collection, getDocs, query, where, doc, updateDoc,
} from "firebase/firestore";
import { C, S } from "./styles";

// ─── Auth Context ─────────────────────────────────────────────
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await fetchProfile(u.uid);
      else    setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function fetchProfile(uid) {
    // Try uid field match first
    let snap = await getDocs(
      query(collection(db, "users"), where("uid", "==", uid))
    );
    if (!snap.empty) {
      setProfile({ id: snap.docs[0].id, ...snap.docs[0].data() });
      return;
    }
    // Fallback: first doc (handles manual Firestore creation without uid field)
    const all = await getDocs(collection(db, "users"));
    if (!all.empty) {
      const d = all.docs[0];
      await updateDoc(doc(db, "users", d.id), { uid });
      setProfile({ id: d.id, uid, ...d.data() });
    }
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user.uid);
  }

  function logout() {
    setProfile(null);
    return signOut(auth);
  }

  return (
    <AuthCtx.Provider value={{ user, profile, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ─── Login Screen ─────────────────────────────────────────────
export function LoginScreen() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);

  async function handle(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try { await login(email, password); }
    catch { setError("Invalid email or password."); }
    setBusy(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 40, width: 360,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.accent, letterSpacing: "0.2em" }}>
            ◈ EVENTRA
          </div>
          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.2em", marginTop: 4 }}>
            RENTAL & EVENT MANAGEMENT
          </div>
        </div>

        {error && <div style={S.alert("error")}>{error}</div>}

        <form onSubmit={handle}>
          <div style={S.formGroup}>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          <button style={{ ...S.btn("primary"), width: "100%", padding: 12, marginTop: 8 }}
            type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ fontSize: 10, color: C.textDim, textAlign: "center", marginTop: 20 }}>
          Contact your administrator to create an account.
        </p>
      </div>
    </div>
  );
}
