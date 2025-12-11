import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageModal } from "./Modals";
import "../styles/CreateScenario.css";
import "../styles/Dashboard.css";
import config from "../config";

const defaultStop = (id) => ({
  id,
  name: "",
  staySeconds: 60,
  betweenSeconds: 0,
  emergencyEnabled: false,
  emergencySeconds: 0,
  emergencies: [],
});

const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const CreateScenario = () => {
  const navigate = useNavigate();
  const [scenarioName, setScenarioName] = useState("");
  const [theme, setTheme] = useState("dark");
  const [stops, setStops] = useState([
    defaultStop(1),
    defaultStop(2),
    defaultStop(3),
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [totalSeconds, setTotalSeconds] = useState(0);

  // Modal state
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showMessage = (title, message, type = "info") => {
    setMessageModal({ isOpen: true, title, message, type });
  };

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, title: "", message: "", type: "info" });
  };

  useEffect(() => {
    const total = stops.reduce((acc, s) => {
      const stay = Number(s.staySeconds) || 0;
      const between = Number(s.betweenSeconds) || 0;
      // Emergency time is separate from stay/travel time
      const emergenciesSum = Array.isArray(s.emergencies)
        ? s.emergencies.reduce((ea, e) => ea + (Number(e.seconds) || 0), 0)
        : 0;
      return acc + stay + between + emergenciesSum;
    }, 0);
    setTotalSeconds(total);
  }, [stops]);

  const addStop = () => {
    setStops((prev) => [...prev, defaultStop(Date.now())]);
  };

  const removeStop = (id) => {
    if (stops.length > 1) {
      setStops(stops.filter((stop) => stop.id !== id));
    }
  };

  const updateStop = (id, field, value) => {
    setStops(
      stops.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop))
    );
  };

  const addEmergency = (index) => {
    setStops((prev) => {
      const hasAny = prev.some((s) => (s.emergencies || []).length > 0);
      if (hasAny) return prev;
      return prev.map((s, i) =>
        i === index
          ? {
              ...s,
              emergencies: [
                ...(s.emergencies || []),
                { text: "", seconds: 30 },
              ],
            }
          : s
      );
    });
  };

  const updateEmergency = (stopIndex, emIndex, field, value) => {
    setStops((prev) =>
      prev.map((s, i) => {
        if (i !== stopIndex) return s;
        const next = (s.emergencies || []).map((e, ei) =>
          ei === emIndex
            ? {
                ...e,
                [field]:
                  field === "seconds" ? Math.max(0, Number(value || 0)) : value,
              }
            : e
        );
        return { ...s, emergencies: next };
      })
    );
  };

  const removeEmergency = (stopIndex, emIndex) => {
    setStops((prev) =>
      prev.map((s, i) => {
        if (i !== stopIndex) return s;
        const next = (s.emergencies || []).filter((_, ei) => ei !== emIndex);
        return { ...s, emergencies: next };
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!scenarioName.trim()) {
      setError("Please enter a scenario name");
      setSaving(false);
      return;
    }

    if (stops.some((stop) => !stop.name.trim())) {
      setError("Please enter names for all stops");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showMessage(
          "Authentication Required",
          "Authentication token not found. Please login again.",
          "error"
        );
        setSaving(false);
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      const response = await fetch(`${config.API_BASE_URL}/scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: scenarioName,
          theme: theme,
          stops: stops.map((stop) => ({
            name: stop.name,
            durationSeconds: Number(stop.staySeconds) || 0,
            staySeconds: Number(stop.staySeconds) || 0,
            betweenSeconds: Number(stop.betweenSeconds) || 0,
            emergencyEnabled:
              !!(stop.emergencies && stop.emergencies.length > 0) ||
              !!stop.emergencyEnabled,
            emergencySeconds:
              Number(
                (stop.emergencies &&
                  stop.emergencies[0] &&
                  stop.emergencies[0].seconds) ||
                  stop.emergencySeconds
              ) || 0,
            emergencies: (stop.emergencies || []).map((e) => ({
              text: e.text || "",
              seconds: Number(e.seconds) || 0,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showMessage(
          "Session Expired",
          "Your session has expired. Please login again.",
          "error"
        );
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (data.success) {
        const cachedScenarios = localStorage.getItem("scenarios");
        if (cachedScenarios) {
          try {
            const scenarios = JSON.parse(cachedScenarios);
            scenarios.unshift(data.scenario);
            localStorage.setItem("scenarios", JSON.stringify(scenarios));
          } catch (error) {
            console.error("Error updating cache:", error);
          }
        }

        showMessage(
          "Success!",
          "Scenario created successfully!\n\nVideo is being generated and will be available shortly.",
          "success"
        );
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Failed to create scenario");
        showMessage(
          "Creation Failed",
          data.message || "Failed to create scenario. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating scenario:", error);
      setError("Failed to create scenario. Please try again.");
      showMessage(
        "Error",
        "Failed to create scenario. Please try again.",
        "error"
      );
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

  const anyEmergency = stops.some((s) => (s.emergencies || []).length > 0);

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">New Scenario</h1>
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
      <div className="scenario-form">
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            // gap: 12,
          }}
        >
          <div className="input-group" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Enter the Scenario Name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              required
            />
          </div>
          <div className="input-group" style={{ width: 200 }}>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
          </div>
        </div>

        <h3>Stops</h3>

        <form onSubmit={handleSubmit}>
          <div
            className="table-header"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 200px 230px 80px",
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "8px 8px 0 0",
              border: "1px solid #e5e7eb",
              borderBottom: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              // gap: 12,
            }}
          >
            <div>
              Stop Name <span style={{ color: "#ef4444" }}>*</span>
            </div>
            <div>
              Travel Time (sec) <span style={{ color: "#ef4444" }}>*</span>
            </div>
            <div>
              Stay Duration (sec) <span style={{ color: "#ef4444" }}>*</span>
            </div>
            <div></div>
          </div>
          {stops.map((stop, idx) => (
            <React.Fragment key={idx}>
              <div
                key={stop.id}
                className="stop-row"
                style={{
                  padding: 12,
                  border: "1px solid #e5e7eb",
                  borderTop: idx === 0 ? "1px solid #e5e7eb" : "none",
                  borderRadius:
                    idx === stops.length - 1 &&
                    (stop.emergencies || []).length === 0
                      ? "0 0 8px 8px"
                      : "0",
                  marginBottom: (stop.emergencies || []).length > 0 ? 0 : 0,
                }}
              >
                <div
                  className="stop-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 200px 230px 80px",
                    // gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div className="stop-input">
                      <input
                        type="text"
                        placeholder="e.g., Ilmenau Politzer Höhe"
                        value={stop.name}
                        onChange={(e) =>
                          updateStop(stop.id, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="stop-input">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        step="1"
                        placeholder="60"
                        value={stop.staySeconds}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || Number(val) >= 0) {
                            updateStop(
                              stop.id,
                              "staySeconds",
                              val === "" ? "" : Math.max(0, parseInt(val) || 0)
                            );
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            updateStop(stop.id, "staySeconds", 0);
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="stop-input">
                      <input
                        type="number"
                        min="0"
                        max="999"
                        step="1"
                        placeholder="30"
                        value={stop.betweenSeconds}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || Number(val) >= 0) {
                            updateStop(
                              stop.id,
                              "betweenSeconds",
                              val === "" ? "" : Math.max(0, parseInt(val) || 0)
                            );
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            updateStop(stop.id, "betweenSeconds", 0);
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 4 }}>
                    {stops.length > 1 && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeStop(stop.id)}
                        style={{ padding: "8px 12px" }}
                        title="Delete stop"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  {!anyEmergency && (
                    <button
                      type="button"
                      onClick={() => addEmergency(idx)}
                      style={{
                        position: "relative",
                        background: "#dc2626",
                        color: "white",
                        border: "3px solid #991b1b",
                        padding: "10px 20px",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        boxShadow:
                          "0 0 20px rgba(220, 38, 38, 0.5), inset 0 -3px 0 rgba(0,0,0,0.2)",
                        transition: "all 0.2s ease",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        animation: "pulse 2s infinite",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "0 0 30px rgba(220, 38, 38, 0.7), inset 0 -3px 0 rgba(0,0,0,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 0 20px rgba(220, 38, 38, 0.5), inset 0 -3px 0 rgba(0,0,0,0.2)";
                      }}
                    >
                      🚨 Add Emergency
                    </button>
                  )}
                </div>
              </div>

              {(stop.emergencies || []).map((em, ei) => (
                <div
                  key={`em-${idx}-${ei}`}
                  style={{
                    padding: 12,
                    border: "1px solid #f3a683",
                    borderTop: "1px dashed #f3a683",
                    borderRadius:
                      ei === (stop.emergencies || []).length - 1 &&
                      idx === stops.length - 1
                        ? "0 0 8px 8px"
                        : "0",
                    background: "#fffaf0",
                  }}
                >
                  <div
                    className="emergency-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 200px 80px",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <input
                        type="text"
                        placeholder="Emergency description"
                        value={em.text}
                        onChange={(e) =>
                          updateEmergency(idx, ei, "text", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: 8,
                          border: "1px solid #fbbf24",
                          borderRadius: 6,
                        }}
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Duration (sec)"
                        value={em.seconds}
                        onChange={(e) =>
                          updateEmergency(idx, ei, "seconds", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: 8,
                          border: "1px solid #fbbf24",
                          borderRadius: 6,
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => removeEmergency(idx, ei)}
                        style={{ padding: "8px 12px" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
          <div style={{ marginBottom: 12 }}>
            <button
              className="add-stop-btn"
              onClick={(e) => {
                e.preventDefault();
                addStop();
              }}
              type="button"
            >
              ➕ Add Stop
            </button>
          </div>

          <div className="form-actions" style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "⏳ Saving..." : "💾 Save Scenario"}
            </button>
            <div
              style={{
                marginLeft: "auto",
                color: "#374151",
                alignSelf: "center",
              }}
            >
              Total: <strong>{formatTime(totalSeconds)}</strong>
            </div>
          </div>
        </form>
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

export default CreateScenario;
