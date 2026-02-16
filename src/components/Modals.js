export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
}) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case "danger":
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
              stroke="#d97706"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
          bg: "#fef3c7",
          color: "#d97706",
        };
      default:
        return {
          icon: (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          ),
          bg: "#dbeafe",
          color: "#2563eb",
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
          maxWidth: 440,
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
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 24px",
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
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
            Confirm
          </button>
        </div>
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

// Message Modal Component (for alerts)
export const MessageModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}) => {
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
              stroke="#d97706"
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

export const Snackbar = ({ isOpen, message, type = "error", onClose }) => {
  if (!isOpen) return null;

  const getStyleByType = () => {
    switch (type) {
      case "error":
        return {
          backgroundColor: "#dc2626",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ),
        };
      case "success":
        return {
          backgroundColor: "#16a34a",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
        };
      case "warning":
        return {
          backgroundColor: "#d97706",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ),
        };
      default:
        return {
          backgroundColor: "#2563eb",
          icon: (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          ),
        };
    }
  };

  const { backgroundColor, icon } = getStyleByType();

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: backgroundColor,
        color: "white",
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 10000,
        minWidth: "300px",
        maxWidth: "500px",
        animation: "slideDown 0.3s ease-out",
      }}
    >
      {icon}
      <span style={{ flex: 1, fontSize: "15px", fontWeight: "500" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          opacity: 0.8,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
};
