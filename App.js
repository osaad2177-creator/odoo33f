// ============================================================
//  ERP / CRM  —  Single-File React App
//  Dependencies (install with npm):
//    firebase  react  react-dom
//  Paste your Firebase config in ./firebase-config.js
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "./firebase-config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

// ─── Inline Styles ───────────────────────────────────────────
const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceAlt: "#22263a",
  border: "#2e3350",
  accent: "#4f7cff",
  accentHover: "#6b93ff",
  success: "#30d158",
  warning: "#ffd60a",
  danger: "#ff453a",
  text: "#e8eaf6",
  textMuted: "#7b82a8",
  textDim: "#4a5080",
};

const S = {
  // Layout
  root: {
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    background: COLORS.bg,
    minHeight: "100vh",
    color: COLORS.text,
  },
  topBar: {
    background: COLORS.surface,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: COLORS.accent,
    textTransform: "uppercase",
  },
  userInfo: { fontSize: 12, color: COLORS.textMuted, textAlign: "right" },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },

  // Nav tabs
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 32,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 0,
  },
  tab: (active) => ({
    padding: "10px 20px",
    background: "none",
    border: "none",
    borderBottom: active ? `2px solid ${COLORS.accent}` : "2px solid transparent",
    color: active ? COLORS.accent : COLORS.textMuted,
    cursor: "pointer",
    fontSize: 13,
    letterSpacing: "0.08em",
    fontFamily: "inherit",
    fontWeight: active ? 700 : 400,
    transition: "all 0.15s",
    marginBottom: -1,
  }),

  // Cards / panels
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: COLORS.textMuted,
    marginBottom: 18,
    fontWeight: 700,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },

  // Stat boxes
  statBox: {
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: "18px 20px",
  },
  statLabel: { fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" },
  statValue: { fontSize: 28, fontWeight: 700, color: COLORS.text, marginTop: 6 },

  // Form
  formGroup: { marginBottom: 14 },
  label: { display: "block", fontSize: 11, color: COLORS.textMuted, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" },
  input: {
    width: "100%",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 5,
    padding: "9px 12px",
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  select: {
    width: "100%",
    background: COLORS.surfaceAlt,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 5,
    padding: "9px 12px",
    color: COLORS.text,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },

  // Buttons
  btn: (variant = "primary") => ({
    padding: "9px 18px",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    transition: "all 0.15s",
    background:
      variant === "primary" ? COLORS.accent :
      variant === "danger"  ? COLORS.danger :
      variant === "success" ? COLORS.success :
      COLORS.surfaceAlt,
    color: variant === "ghost" ? COLORS.textMuted : "#fff",
  }),

  // Table
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: COLORS.textMuted,
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: 700,
  },
  td: {
    padding: "11px 12px",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    verticalAlign: "middle",
  },
  trHover: { background: COLORS.surfaceAlt },

  // Badge
  badge: (color) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    background: color === "green" ? "#1a3a26" :
                color === "yellow"? "#3a3010" :
                color === "red"   ? "#3a1a1a" :
                color === "blue"  ? "#1a2a4a" : "#222",
    color: color === "green" ? COLORS.success :
           color === "yellow"? COLORS.warning :
           color === "red"   ? COLORS.danger :
           color === "blue"  ? COLORS.accent : COLORS.textMuted,
    border: `1px solid ${
      color === "green" ? "#2a5a3a" :
      color === "yellow"? "#5a4a10" :
      color === "red"   ? "#5a2a2a" :
      color === "blue"  ? "#2a4a7a" : COLORS.border
    }`,
  }),

  // Alert
  alert: (type) => ({
    padding: "10px 14px",
    borderRadius: 5,
    fontSize: 12,
    marginBottom: 14,
    background: type === "error" ? "#3a1a1a" : "#1a3a26",
    border: `1px solid ${type === "error" ? "#5a2a2a" : "#2a5a3a"}`,
    color: type === "error" ? COLORS.danger : COLORS.success,
  }),

  // Login
  loginWrap: {
    minHeight: "100vh",
    background: COLORS.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  loginBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: 40,
    width: 360,
  },
};

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n) {
  return Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateStr(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-GB");
}

function datesOverlap(s1, e1, s2, e2) {
  return s1 <= e2 && e1 >= s2;
}

// ─── Role Access Map ─────────────────────────────────────────
const TABS_FOR_ROLE = {
  admin:     ["Dashboard", "Inventory", "Bookings", "Accounting", "Users"],
  inventory: ["Inventory"],
  sales:     ["Bookings"],
  accountant:["Accounting", "Bookings"],
};

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const [user, setUser]           = useState(null);   // Firebase auth user
  const [profile, setProfile]     = useState(null);   // Firestore user doc
  const [authLoading, setAuthLoading] = useState(true);

  // Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u.uid);
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  async function loadProfile(uid) {
    // Try matching by uid field first
    let snap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
    if (!snap.empty) {
      setProfile({ id: snap.docs[0].id, ...snap.docs[0].data() });
      return;
    }
    // Fallback: scan all user docs — handles case where doc was created
    // without a uid field (e.g. manually in Firestore console)
    const allSnap = await getDocs(collection(db, "users"));
    if (!allSnap.empty) {
      // Use the first doc and patch it with the correct uid
      const firstDoc = allSnap.docs[0];
      const data = firstDoc.data();
      // Write the uid back so future logins work correctly
      await updateDoc(doc(db, "users", firstDoc.id), { uid });
      setProfile({ id: firstDoc.id, uid, ...data });
    }
  }

  if (authLoading) {
    return (
      <div style={{ ...S.loginWrap, color: COLORS.textMuted, fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginScreen onLogin={loadProfile} />;
  }

  return <Dashboard user={user} profile={profile} onLogout={() => signOut(auth)} />;
}

// ─── Login Screen ────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await onLogin(cred.user.uid);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={S.loginWrap}>
      <div style={S.loginBox}>
        <div style={{ ...S.logo, marginBottom: 30, textAlign: "center" }}>
          ◈ ERP · CRM
        </div>
        {error && <div style={S.alert("error")}>{error}</div>}
        <form onSubmit={handleLogin}>
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
          <button style={{ ...S.btn("primary"), width: "100%", marginTop: 8, padding: "12px" }}
            type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p style={{ fontSize: 11, color: COLORS.textDim, marginTop: 20, textAlign: "center" }}>
          Contact your administrator to create an account.
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard Shell ─────────────────────────────────────────
function Dashboard({ user, profile, onLogout }) {
  const allowedTabs = TABS_FOR_ROLE[profile.role] || ["Dashboard"];
  const [activeTab, setActiveTab] = useState(allowedTabs[0]);

  return (
    <div style={S.root}>
      <div style={S.topBar}>
        <div style={S.logo}>◈ ERP · CRM</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={S.userInfo}>
            <div>{profile.name || user.email}</div>
            <div style={{ marginTop: 2 }}>
              <span style={S.badge("blue")}>{profile.role}</span>
            </div>
          </div>
          <button style={S.btn("ghost")} onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      <div style={S.main}>
        {/* Tabs */}
        <div style={S.tabs}>
          {allowedTabs.map(tab => (
            <button key={tab} style={S.tab(activeTab === tab)}
              onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        {activeTab === "Dashboard"  && <DashboardTab profile={profile} />}
        {activeTab === "Inventory"  && <InventoryTab profile={profile} />}
        {activeTab === "Bookings"   && <BookingsTab  profile={profile} />}
        {activeTab === "Accounting" && <AccountingTab />}
        {activeTab === "Users"      && <UsersTab />}
      </div>
    </div>
  );
}

// ─── Dashboard Tab ───────────────────────────────────────────
function DashboardTab({ profile }) {
  const [stats, setStats] = useState({ products: 0, bookings: 0, revenue: 0, activeBookings: 0 });

  useEffect(() => {
    async function load() {
      const [prodSnap, bookSnap, txSnap] = await Promise.all([
        getDocs(collection(db, "inventory")),
        getDocs(collection(db, "bookings")),
        getDocs(collection(db, "transactions")),
      ]);
      const today = new Date(); today.setHours(0,0,0,0);
      const active = bookSnap.docs.filter(d => {
        const b = d.data();
        return b.status === "active" && new Date(b.endDate) >= today;
      }).length;
      const rev = txSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
      setStats({
        products: prodSnap.size,
        bookings: bookSnap.size,
        activeBookings: active,
        revenue: rev,
      });
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          Welcome back, {profile.name || "User"}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
          {new Date().toLocaleDateString("en-GB", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
        </div>
      </div>

      <div style={S.grid3}>
        <div style={S.statBox}>
          <div style={S.statLabel}>Total Products</div>
          <div style={S.statValue}>{stats.products}</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statLabel}>Active Bookings</div>
          <div style={S.statValue}>{stats.activeBookings}</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statLabel}>Total Revenue</div>
          <div style={{ ...S.statValue, color: COLORS.success }}>
            ${fmt(stats.revenue)}
          </div>
        </div>
      </div>

      <div style={{ ...S.card, borderLeft: `3px solid ${COLORS.accent}` }}>
        <div style={S.cardTitle}>Quick Access</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.8 }}>
          Use the tabs above to navigate between modules. Your role
          <span style={S.badge("blue")}> {profile.role} </span>
          determines which sections are visible to you.
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Tab ───────────────────────────────────────────
function InventoryTab({ profile }) {
  const canEdit = ["admin", "inventory"].includes(profile.role);
  const [products, setProducts] = useState([]);
  const [form, setForm]         = useState({ name: "", quantity: 1, pricePerDay: 0 });
  const [editId, setEditId]     = useState(null);
  const [editQty, setEditQty]   = useState("");
  const [msg, setMsg]           = useState(null);
  const [loading, setLoading]   = useState(false);

  const loadProducts = useCallback(async () => {
    const snap = await getDocs(collection(db, "inventory"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function addProduct(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    await addDoc(collection(db, "inventory"), {
      name: form.name.trim(),
      quantity: Number(form.quantity),
      pricePerDay: Number(form.pricePerDay),
      status: "available",
      createdAt: serverTimestamp(),
    });
    setForm({ name: "", quantity: 1, pricePerDay: 0 });
    setMsg({ type: "success", text: "Product added successfully." });
    await loadProducts();
    setLoading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function saveQty(id) {
    await updateDoc(doc(db, "inventory", id), { quantity: Number(editQty) });
    setEditId(null);
    await loadProducts();
  }

  async function toggleStatus(p) {
    const next = p.status === "available" ? "rented" : "available";
    await updateDoc(doc(db, "inventory", p.id), { status: next });
    await loadProducts();
  }

  return (
    <div>
      {canEdit && (
        <div style={S.card}>
          <div style={S.cardTitle}>Add New Product</div>
          {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
          <form onSubmit={addProduct}>
            <div style={S.grid2}>
              <div style={S.formGroup}>
                <label style={S.label}>Product Name</label>
                <input style={S.input} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Forklift XL-200" required />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Quantity</label>
                <input style={S.input} type="number" min="1" value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })} />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Price Per Day ($)</label>
              <input style={S.input} type="number" min="0" step="0.01" value={form.pricePerDay}
                onChange={e => setForm({ ...form, pricePerDay: e.target.value })} />
            </div>
            <button style={S.btn("primary")} type="submit" disabled={loading}>
              {loading ? "Adding…" : "+ Add Product"}
            </button>
          </form>
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>Inventory List ({products.length})</div>
        {products.length === 0 ? (
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No products yet.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Name</th>
                <th style={S.th}>Qty</th>
                <th style={S.th}>Price/Day</th>
                <th style={S.th}>Status</th>
                {canEdit && <th style={S.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={S.td}>{p.name}</td>
                  <td style={S.td}>
                    {editId === p.id ? (
                      <span style={{ display:"flex", gap:6 }}>
                        <input style={{ ...S.input, width:70 }} type="number" value={editQty}
                          onChange={e => setEditQty(e.target.value)} />
                        <button style={S.btn("success")} onClick={() => saveQty(p.id)}>✓</button>
                        <button style={S.btn("ghost")} onClick={() => setEditId(null)}>✕</button>
                      </span>
                    ) : p.quantity}
                  </td>
                  <td style={S.td}>${fmt(p.pricePerDay || 0)}</td>
                  <td style={S.td}>
                    <span style={S.badge(p.status === "available" ? "green" : "yellow")}>
                      {p.status}
                    </span>
                  </td>
                  {canEdit && (
                    <td style={S.td}>
                      <span style={{ display:"flex", gap:6 }}>
                        <button style={S.btn("ghost")} onClick={() => { setEditId(p.id); setEditQty(p.quantity); }}>
                          Edit Qty
                        </button>
                        <button style={S.btn("ghost")} onClick={() => toggleStatus(p)}>
                          {p.status === "available" ? "Mark Rented" : "Mark Available"}
                        </button>
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Bookings Tab ────────────────────────────────────────────
function BookingsTab({ profile }) {
  const canCreate = ["admin", "sales"].includes(profile.role);
  const [bookings, setBookings]   = useState([]);
  const [products, setProducts]   = useState([]);
  const [form, setForm]           = useState({ clientName:"", productId:"", startDate:"", endDate:"", price:0 });
  const [msg, setMsg]             = useState(null);
  const [loading, setLoading]     = useState(false);

  const loadAll = useCallback(async () => {
    const [bSnap, pSnap] = await Promise.all([
      getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc"))),
      getDocs(collection(db, "inventory")),
    ]);
    setBookings(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-fill price when product + dates change
  useEffect(() => {
    if (form.productId && form.startDate && form.endDate) {
      const prod = products.find(p => p.id === form.productId);
      if (prod && prod.pricePerDay) {
        const days = Math.max(1, Math.round(
          (new Date(form.endDate) - new Date(form.startDate)) / 86400000
        ) + 1);
        setForm(f => ({ ...f, price: prod.pricePerDay * days }));
      }
    }
  }, [form.productId, form.startDate, form.endDate, products]);

  async function createBooking(e) {
    e.preventDefault();
    setMsg(null);
    if (!form.clientName || !form.productId || !form.startDate || !form.endDate) {
      setMsg({ type:"error", text:"Please fill in all fields." }); return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setMsg({ type:"error", text:"End date must be after start date." }); return;
    }

    // Conflict check
    const conflicts = bookings.filter(b =>
      b.productId === form.productId &&
      b.status === "active" &&
      datesOverlap(
        new Date(form.startDate), new Date(form.endDate),
        new Date(b.startDate),    new Date(b.endDate)
      )
    );
    if (conflicts.length > 0) {
      setMsg({ type:"error", text:`This item is already booked from ${conflicts[0].startDate} to ${conflicts[0].endDate}.` });
      return;
    }

    setLoading(true);
    const prod = products.find(p => p.id === form.productId);
    const bookingRef = await addDoc(collection(db, "bookings"), {
      clientName:  form.clientName.trim(),
      productId:   form.productId,
      productName: prod?.name || "",
      startDate:   form.startDate,
      endDate:     form.endDate,
      price:       Number(form.price),
      status:      "active",
      createdBy:   profile.name || "unknown",
      createdAt:   serverTimestamp(),
    });

    // Record income transaction
    await addDoc(collection(db, "transactions"), {
      type:        "income",
      description: `Booking: ${form.clientName} — ${prod?.name}`,
      amount:      Number(form.price),
      bookingId:   bookingRef.id,
      date:        form.startDate,
      createdAt:   serverTimestamp(),
    });

    // Update product status if needed
    if (prod) {
      await updateDoc(doc(db, "inventory", form.productId), { status: "rented" });
    }

    setForm({ clientName:"", productId:"", startDate:"", endDate:"", price:0 });
    setMsg({ type:"success", text:"Booking created and income recorded!" });
    await loadAll();
    setLoading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function cancelBooking(b) {
    await updateDoc(doc(db, "bookings", b.id), { status: "cancelled" });
    // Mark product available again
    await updateDoc(doc(db, "inventory", b.productId), { status: "available" });
    await loadAll();
  }

  return (
    <div>
      {canCreate && (
        <div style={S.card}>
          <div style={S.cardTitle}>Create New Booking</div>
          {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
          <form onSubmit={createBooking}>
            <div style={S.grid2}>
              <div style={S.formGroup}>
                <label style={S.label}>Client Name</label>
                <input style={S.input} value={form.clientName}
                  onChange={e => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Full name" />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Product</label>
                <select style={S.select} value={form.productId}
                  onChange={e => setForm({ ...form, productId: e.target.value })}>
                  <option value="">Select product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status}) — ${fmt(p.pricePerDay || 0)}/day
                    </option>
                  ))}
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Start Date</label>
                <input style={S.input} type="date" value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>End Date</label>
                <input style={S.input} type="date" value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Total Price ($)</label>
              <input style={S.input} type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <button style={S.btn("primary")} type="submit" disabled={loading}>
              {loading ? "Creating…" : "+ Create Booking"}
            </button>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div style={S.card}>
        <div style={S.cardTitle}>All Bookings ({bookings.length})</div>
        {bookings.length === 0 ? (
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No bookings yet.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Client</th>
                <th style={S.th}>Product</th>
                <th style={S.th}>Start</th>
                <th style={S.th}>End</th>
                <th style={S.th}>Price</th>
                <th style={S.th}>Status</th>
                {canCreate && <th style={S.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td style={S.td}>{b.clientName}</td>
                  <td style={S.td}>{b.productName}</td>
                  <td style={S.td}>{b.startDate}</td>
                  <td style={S.td}>{b.endDate}</td>
                  <td style={S.td}>${fmt(b.price || 0)}</td>
                  <td style={S.td}>
                    <span style={S.badge(
                      b.status === "active" ? "green" :
                      b.status === "cancelled" ? "red" : "yellow"
                    )}>
                      {b.status}
                    </span>
                  </td>
                  {canCreate && (
                    <td style={S.td}>
                      {b.status === "active" && (
                        <button style={S.btn("danger")} onClick={() => cancelBooking(b)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Accounting Tab ──────────────────────────────────────────
function AccountingTab() {
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyMap, setMonthlyMap]     = useState({});

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc")));
      const txs  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txs);
      const total = txs.reduce((s, t) => s + (t.amount || 0), 0);
      setTotalRevenue(total);
      // Group by month
      const mm = {};
      txs.forEach(t => {
        const key = t.date ? t.date.slice(0,7) : "unknown";
        mm[key] = (mm[key] || 0) + (t.amount || 0);
      });
      setMonthlyMap(mm);
    }
    load();
  }, []);

  const months = Object.entries(monthlyMap).sort((a,b) => b[0].localeCompare(a[0]));

  return (
    <div>
      {/* Summary */}
      <div style={{ ...S.grid2, marginBottom: 20 }}>
        <div style={S.statBox}>
          <div style={S.statLabel}>Total Revenue</div>
          <div style={{ ...S.statValue, color: COLORS.success }}>${fmt(totalRevenue)}</div>
        </div>
        <div style={S.statBox}>
          <div style={S.statLabel}>Total Transactions</div>
          <div style={S.statValue}>{transactions.length}</div>
        </div>
      </div>

      {/* Monthly summary */}
      {months.length > 0 && (
        <div style={S.card}>
          <div style={S.cardTitle}>Monthly Revenue</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Month</th>
                <th style={S.th}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {months.map(([month, amt]) => (
                <tr key={month}>
                  <td style={S.td}>{month}</td>
                  <td style={{ ...S.td, color: COLORS.success }}>${fmt(amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All transactions */}
      <div style={S.card}>
        <div style={S.cardTitle}>All Transactions ({transactions.length})</div>
        {transactions.length === 0 ? (
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No transactions recorded yet.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Date</th>
                <th style={S.th}>Description</th>
                <th style={S.th}>Type</th>
                <th style={S.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={S.td}>{t.date || "—"}</td>
                  <td style={S.td}>{t.description}</td>
                  <td style={S.td}>
                    <span style={S.badge(t.type === "income" ? "green" : "red")}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ ...S.td, color: COLORS.success }}>${fmt(t.amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Users Tab (Admin only) ──────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState([]);
  const [form, setForm]       = useState({ email:"", name:"", role:"sales", uid:"" });
  const [msg, setMsg]         = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // NOTE: Creating Firebase Auth users from client side requires
  // either the Admin SDK (server) or a Cloud Function.
  // This panel registers the user profile in Firestore.
  // The user must already exist in Firebase Auth (created via Console or sign-up flow).
  async function registerProfile(e) {
    e.preventDefault();
    if (!form.uid || !form.name || !form.email) {
      setMsg({ type:"error", text:"UID, name, and email are required." }); return;
    }
    setLoading(true);
    // Check duplicate
    const existing = users.find(u => u.uid === form.uid);
    if (existing) {
      setMsg({ type:"error", text:"A profile with this UID already exists." });
      setLoading(false); return;
    }
    await addDoc(collection(db, "users"), {
      uid:   form.uid.trim(),
      email: form.email.trim(),
      name:  form.name.trim(),
      role:  form.role,
      createdAt: serverTimestamp(),
    });
    setForm({ email:"", name:"", role:"sales", uid:"" });
    setMsg({ type:"success", text:"User profile registered." });
    await loadUsers();
    setLoading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  async function changeRole(u, newRole) {
    await updateDoc(doc(db, "users", u.id), { role: newRole });
    await loadUsers();
  }

  return (
    <div>
      <div style={S.card}>
        <div style={S.cardTitle}>Register User Profile</div>
        <div style={{ ...S.alert(""), background:"#1a2a3a", border:`1px solid #2a4a7a`, color: COLORS.accent, marginBottom: 14, fontSize: 12 }}>
          ℹ First create the user in Firebase Console (Authentication → Add User), copy their UID, then register their profile here.
        </div>
        {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}
        <form onSubmit={registerProfile}>
          <div style={S.grid2}>
            <div style={S.formGroup}>
              <label style={S.label}>Firebase UID</label>
              <input style={S.input} value={form.uid}
                onChange={e => setForm({ ...form, uid: e.target.value })}
                placeholder="Paste UID from Firebase Console" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Display Name</label>
              <input style={S.input} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Smith" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@company.com" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Role</label>
              <select style={S.select} value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="inventory">Inventory</option>
                <option value="sales">Sales</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </div>
          <button style={S.btn("primary")} type="submit" disabled={loading}>
            {loading ? "Saving…" : "+ Register Profile"}
          </button>
        </form>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>System Users ({users.length})</div>
        {users.length === 0 ? (
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No user profiles found.</div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Name</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>UID</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={S.td}>{u.name}</td>
                  <td style={S.td}>{u.email}</td>
                  <td style={{ ...S.td, color: COLORS.textDim, fontSize: 11 }}>{u.uid?.slice(0,12)}…</td>
                  <td style={S.td}><span style={S.badge("blue")}>{u.role}</span></td>
                  <td style={S.td}>
                    <select style={{ ...S.select, width:"auto" }}
                      value={u.role}
                      onChange={e => changeRole(u, e.target.value)}>
                      <option value="admin">Admin</option>
                      <option value="inventory">Inventory</option>
                      <option value="sales">Sales</option>
                      <option value="accountant">Accountant</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
