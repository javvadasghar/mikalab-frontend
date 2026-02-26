import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "#d4e7f0" }}
    >
      <div className="card shadow p-5 text-center" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="mb-4">
          <span style={{ fontSize: "90px", lineHeight: 1 }}>🔍</span>
        </div>

        <h1
          className="fw-bold mb-2"
          style={{ fontSize: "96px", color: "#5865f2", lineHeight: 1 }}
        >
          404
        </h1>

        <h2
          className="fw-semibold mb-3"
          style={{ fontSize: "24px", color: "#2c3e50" }}
        >
          Page Not Found
        </h2>

        <p className="text-muted mb-4" style={{ fontSize: "16px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button
          className="btn w-100 py-2 fw-bold"
          style={{
            backgroundColor: "#5865f2",
            color: "#ffffff",
            borderRadius: "10px",
            fontSize: "18px",
            border: "none",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
