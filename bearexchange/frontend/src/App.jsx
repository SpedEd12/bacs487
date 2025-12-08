// frontend/src/App.jsx

import React, { useEffect, useState } from "react";
import { registerUser, verifyUser, loginUser, getBackendHealth } from "./api";

function App() {
  const [activeTab, setActiveTab] = useState("register"); // "register" | "verify" | "login"
  const [backendStatus, setBackendStatus] = useState("Checking...");

  // On load, check backend health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await getBackendHealth();
        setBackendStatus(res.status === "ok" ? "Online" : "Unknown");
      } catch (err) {
        setBackendStatus("Offline");
      }
    }
    checkHealth();
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1>BearExchange Auth Demo</h1>
        <p>Backend status: <strong>{backendStatus}</strong></p>
      </header>

      {/* Simple tab bar instead of react-router */}
      <nav style={styles.nav}>
        <button
          style={activeTab === "register" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
        <button
          style={activeTab === "verify" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("verify")}
        >
          Verify Account
        </button>
        <button
          style={activeTab === "login" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === "register" && <RegisterForm />}
        {activeTab === "verify" && <VerifyForm />}
        {activeTab === "login" && <LoginForm />}
      </main>
    </div>
  );
}

/* ===============================
   Register Form
   =============================== */
function RegisterForm() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("student"); // student | faculty
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { userId, verificationCode }
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await registerUser({ email, password, displayName, userRole });
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.card}>
      <h2>Create Account</h2>
      <p style={styles.helper}>
        Use <code>@bears.unco.edu</code> for students or <code>@unco.edu</code> for faculty.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          UNC Email
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@bears.unco.edu"
            required
          />
        </label>

        <label style={styles.label}>
          Display Name
          <input
            style={styles.input}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Name shown on listings"
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <label style={styles.label}>
          Role
          <select
            style={styles.input}
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
        </label>

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.resultBox}>
          <p><strong>Account created!</strong></p>
          <p><strong>User ID:</strong> {result.userId}</p>
          <p><strong>Verification code:</strong> {result.verificationCode}</p>
          <p style={styles.helper}>
            Use this <strong>User ID</strong> and <strong>code</strong> on the Verify tab.
          </p>
        </div>
      )}
    </section>
  );
}

/* ===============================
   Verify Form
   =============================== */
function VerifyForm() {
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await verifyUser({ userId, code });
      setMessage(data.message || "Account verified successfully.");
    } catch (err) {
      setError(err.message || "Failed to verify account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.card}>
      <h2>Verify Account</h2>
      <p style={styles.helper}>
        Paste the <strong>User ID</strong> and <strong>verification code</strong> shown after registering.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          User ID
          <input
            style={styles.input}
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="1"
            required
          />
        </label>

        <label style={styles.label}>
          Verification Code
          <input
            style={styles.input}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            required
          />
        </label>

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}
    </section>
  );
}

/* ===============================
   Login Form
   =============================== */
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      setMessage(`Login successful. User ID: ${data.userId}`);
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.card}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          UNC Email
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@bears.unco.edu"
            required
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}
    </section>
  );
}

/* ===============================
   Simple inline styles
   =============================== */

const styles = {
  page: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: "100vh",
    background: "#f4f5fb",
    padding: "2rem",
  },
  header: {
    marginBottom: "1.5rem",
  },
  nav: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  tab: {
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
  tabActive: {
    padding: "0.5rem 1rem",
    borderRadius: "999px",
    border: "1px solid #4b6fff",
    background: "#4b6fff",
    color: "#fff",
    cursor: "pointer",
  },
  main: {
    maxWidth: "480px",
  },
  card: {
    background: "#fff",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginTop: "1rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.9rem",
    gap: "0.25rem",
  },
  input: {
    padding: "0.5rem 0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #d0d4e4",
    fontSize: "0.95rem",
  },
  button: {
    marginTop: "0.5rem",
    padding: "0.6rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    background: "#4b6fff",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  helper: {
    fontSize: "0.85rem",
    color: "#555",
  },
  error: {
    marginTop: "0.75rem",
    color: "#b91c1c",
    fontSize: "0.9rem",
  },
  success: {
    marginTop: "0.75rem",
    color: "#15803d",
    fontSize: "0.9rem",
  },
  resultBox: {
    marginTop: "1rem",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    background: "#eff6ff",
    fontSize: "0.9rem",
  },
};

export default App;
