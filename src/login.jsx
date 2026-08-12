import { useState } from "react";
import "./Login.css";

const API_URL = "http://localhost:8080";

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          typeof data === "string"
            ? data
            : "Invalid email or password"
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));

      onLogin(data);
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Cannot connect to server. Make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          🔎
        </div>

        <h1>Digital Lost & Found</h1>

        <p className="login-subtitle">
          Login to continue
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "🔐 Login"}
          </button>

        </form>

        <p className="register-text">
          Don't have an account?
        </p>

        <button
          className="register-button"
          onClick={onShowRegister}
        >
          Create Account
        </button>

      </div>
    </div>
  );
}

export default Login;