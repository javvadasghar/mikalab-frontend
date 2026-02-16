import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import { Snackbar } from "./Modals";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => {
        setShowSnackbar(false);
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSnackbar(false);
    setError("");
    setLoading(true);

    try {
      const { data } = await userAPI.login(email, password);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        const errorMessage =
          data.message || "Login failed. Please check your credentials.";
        setLoading(false);
        setError(errorMessage);
        setShowSnackbar(true);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError("Network error. Please try again.");
      setShowSnackbar(true);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#d4e7f0" }}
    >
      <div className="card shadow p-5">
        <div className="d-flex justify-content-center mb-4">
          <div
            className="rounded-circle d-flex justify-content-center align-items-center"
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#e8ebf7",
              fontSize: "50px",
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5865f2"
              strokeWidth="2"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        <h2
          className="text-center mb-4 fw-bold"
          style={{ color: "#2c3e50", fontSize: "26px" }}
        >
          Staff / Student Login
        </h2>

        <form onSubmit={handleSubmit} className="w-100">
          <div className="mb-3">
            <div
              className="input-group"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #d1d5db",
                marginBottom: "20px",
              }}
            >
              <span
                className="input-group-text bg-white border-0 ps-3"
                style={{ fontSize: "22px" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                type="email"
                className="form-control border-0 shadow-none"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  fontSize: "16px",
                  padding: "14px 12px",
                  color: "#6b7280",
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div
              className="input-group"
              style={{
                marginBottom: "20px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #d1d5db",
              }}
            >
              <span
                className="input-group-text bg-white border-0 ps-3"
                style={{ fontSize: "22px" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                >
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                className="form-control border-0 shadow-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  fontSize: "16px",
                  padding: "14px 12px",
                  color: "#6b7280",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-semibold text-white"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#9ca3af" : "#5865f2",
              fontSize: "18px",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              transition: "all 0.3s",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          className="text-center mt-4 mb-0"
          style={{ fontSize: "14px", color: "#9ca3af" }}
        >
          © 2026 Mika WebApp
        </p>
      </div>

      <Snackbar
        isOpen={showSnackbar}
        message={error}
        type="error"
        onClose={() => {
          setShowSnackbar(false);
          setError("");
        }}
      />
    </div>
  );
};

export default Login;
