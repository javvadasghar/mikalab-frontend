import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import "../styles/CreateScenario.css";

const MessageModal = ({ isOpen, onClose, title, message, type = "info" }) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          bg: "#d1fae5",
          color: "#34d399",
        };
      case "error":
        return {
          icon: (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f87171"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ),
          bg: "#fee2e2",
          color: "#f87171",
        };
      case "warning":
        return {
          icon: (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
          bg: "#fef3c7",
          color: "#f59e0b",
        };
      default:
        return {
          icon: (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          ),
          bg: "#e0f2fe",
          color: "#38bdf8",
        };
    }
  };

  const { icon, bg, color } = getIconAndColor();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 32,
          maxWidth: 420,
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          {icon}
        </div>

        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 22,
            fontWeight: 700,
            color: "#1f2937",
            textAlign: "center",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "0 0 28px",
            fontSize: 15,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px 24px",
            border: "none",
            background: color,
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          OK
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const NewUser = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onCloseAction: null,
  });

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (!user.isAdmin) {
          showMessage(
            "Access Denied",
            "Admin access only. You will be redirected to the dashboard.",
            "warning",
            () => navigate("/dashboard"),
          );
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/dashboard");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const showMessage = (title, message, type = "info", onCloseAction = null) => {
    setMessageModal({ isOpen: true, title, message, type, onCloseAction });
  };

  const closeMessageModal = () => {
    const action = messageModal.onCloseAction;
    setMessageModal({
      isOpen: false,
      title: "",
      message: "",
      type: "info",
      onCloseAction: null,
    });
    if (action) action();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!firstName.trim()) {
      setError("Please enter first name");
      setSaving(false);
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter last name");
      setSaving(false);
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email");
      setSaving(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setSaving(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const { data } = await userAPI.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        isAdmin: isAdmin,
      });

      if (data.success) {
        showMessage(
          "Success!",
          `User "${firstName} ${lastName}" has been created successfully.`,
          "success",
          () => navigate("/manage-users"),
        );
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("scenarios");
    navigate("/");
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Create New User</h1>
          </div>
          <div className="header-right">
            <button
              className="btn-new-scenario"
              style={{ marginRight: 8 }}
              onClick={() => navigate("/dashboard")}
            >
              ← Back
            </button>
            <button
              className="btn-new-scenario"
              style={{ marginRight: 8 }}
              onClick={() => navigate("/manage-users")}
            >
              Manage Users
            </button>

            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div className="user-form">
        {error && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #fcc",
            }}
          >
            {error}
          </div>
        )}

        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="First Name *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={30}
            required
          />
        </div>

        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="Last Name *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={30}
            required
          />
        </div>

        <div className="input-group">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Password (min 6 characters) *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={20}
            required
          />
        </div>

        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={20}
            required
          />
        </div>

        <div
          style={{
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <input
            type="checkbox"
            id="adminCheckbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              accentColor: "#5b6fe8",
            }}
          />
          <label
            htmlFor="adminCheckbox"
            style={{
              margin: 0,
              cursor: "pointer",
              fontSize: "16px",
              color: "#2c3e50",
              fontWeight: "500",
            }}
          >
            Make this user an Admin
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "⏳ Creating..." : "Save"}
          </button>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />
    </div>
  );
};

export default NewUser;
