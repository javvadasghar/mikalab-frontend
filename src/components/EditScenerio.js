import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageModal } from "./Modals";
import "../styles/CreateScenario.css";
import "../styles/Dashboard.css";
import config from "../config";

const defaultStop = (i = 0) => ({
  name: `Stop ${i + 1}`,
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

const EditScenario = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [scenarioName, setScenarioName] = useState("");
  const [stops, setStops] = useState([defaultStop(0)]);
  const [originalStops, setOriginalStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [stopsModified, setStopsModified] = useState(false);
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
    fetchScenario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const total = stops.reduce((acc, s) => {
      const stay = Number(s.staySeconds) || 0;
      const between = Number(s.betweenSeconds) || 0;
      const primaryEmergency = s.emergencyEnabled
        ? Number(s.emergencySeconds) || 0
        : 0;
      const emergenciesSum = Array.isArray(s.emergencies)
        ? s.emergencies.reduce((ea, e) => ea + (Number(e.seconds) || 0), 0)
        : 0;
      return acc + stay + between + primaryEmergency + emergenciesSum;
    }, 0);
    setTotalSeconds(total);
  }, [stops]);

  useEffect(() => {
    if (originalStops.length > 0) {
      const normalize = (arr) =>
        arr.map((s) => ({
          name: s.name,
          staySeconds: Number(s.staySeconds) || 0,
          betweenSeconds: Number(s.betweenSeconds) || 0,
          emergencyEnabled: !!s.emergencyEnabled,
          emergencySeconds: Number(s.emergencySeconds) || 0,
          emergencies: (s.emergencies || []).map((e) => ({
            text: e.text || "",
            seconds: Number(e.seconds) || 0,
          })),
        }));
      setStopsModified(
        JSON.stringify(normalize(stops)) !==
          JSON.stringify(normalize(originalStops))
      );
    }
  }, [stops, originalStops]);

  const fetchScenario = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/scenario/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success && data.scenario) {
        setScenarioName(data.scenario.name || "");

        const mapped = (data.scenario.stops || []).map((stop, i) => {
          let emergencies = [];
          if (Array.isArray(stop.emergencies)) {
            emergencies = stop.emergencies.map((e) => ({
              text: e.text || "",
              seconds: e.seconds ?? 0,
            }));
          }

          return {
            name: stop.name || `Stop ${i + 1}`,
            staySeconds: stop.staySeconds ?? stop.durationSeconds ?? 60,
            betweenSeconds: stop.betweenSeconds ?? 0,
            emergencyEnabled: !!stop.emergencyEnabled,
            emergencySeconds: stop.emergencySeconds ?? 0,
            emergencies,
          };
        });

        setStops(mapped.length ? mapped : [defaultStop(0)]);
        setOriginalStops(JSON.parse(JSON.stringify(mapped)));
      } else {
        setError(data.message || "Failed to load scenario");
      }
    } catch (err) {
      console.error("Error fetching scenario:", err);
      setError("Failed to load scenario");
    } finally {
      setLoading(false);
    }
  };

  const updateStop = (index, field, value) => {
    setStops((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              [field]:
                field === "staySeconds" ||
                field === "betweenSeconds" ||
                field === "emergencySeconds"
                  ? Math.max(0, Number(value || 0))
                  : value,
            }
          : s
      )
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

  const addStop = () => {
    setStops((prev) => [...prev, defaultStop(prev.length)]);
  };

  const removeStop = (index) => {
    if (stops.length <= 1) return;
    setStops((prev) => prev.filter((_, i) => i !== index));
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

    const payloadStops = stops.map((s) => ({
      name: s.name,
      staySeconds: Number(s.staySeconds) || 0,
      durationSeconds: Number(s.staySeconds) || 0,
      betweenSeconds: Number(s.betweenSeconds) || 0,
      emergencyEnabled: !!s.emergencyEnabled,
      emergencySeconds: Number(s.emergencySeconds) || 0,
      emergencies: (s.emergencies || []).map((e) => ({
        text: e.text || "",
        seconds: Number(e.seconds) || 0,
      })),
    }));

    try {
      const response = await fetch(`${config.API_BASE_URL}/scenario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: scenarioName,
          stops: payloadStops,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const cachedScenarios = localStorage.getItem("scenarios");
        if (cachedScenarios) {
          try {
            const scenarios = JSON.parse(cachedScenarios);
            const updatedScenarios = scenarios.map((s) =>
              s._id === id ? data.scenario : s
            );
            localStorage.setItem("scenarios", JSON.stringify(updatedScenarios));
          } catch (err) {
            console.error("Error updating cache:", err);
          }
        }

        if (data.videoRegenerated) {
          showMessage(
            "Updated Successfully!",
            "Scenario updated successfully!\n\nVideo will be regenerated due to changes in stops.",
            "success"
          );
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          showMessage(
            "Updated Successfully!",
            "Scenario updated successfully!\n\nVideo remains unchanged.",
            "success"
          );
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } else {
        setError(data.message || "Failed to update scenario");
        showMessage(
          "Update Failed",
          data.message || "Failed to update scenario. Please try again.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error updating scenario:", err);
      setError("Failed to update scenario. Please try again.");
      showMessage(
        "Update Failed",
        "Failed to update scenario. Please try again.",
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

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="scenario-form">
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #e5e7eb",
                borderTopColor: "#5b6fe8",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            ></div>
            Loading scenario...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Edit Scenario</h1>
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
        {stopsModified && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderRadius: "10px",
              marginBottom: "20px",
              border: "1px solid #ffeaa7",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
            }}
          >
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <span>
              Stops have been modified. Video will be regenerated after saving.
            </span>
          </div>
        )}

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
          }}
        >
          <div className="input-group" style={{ flex: 1, marginRight: 12 }}>
            <input
              type="text"
              placeholder="Enter the Scenario Name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              required
            />
          </div>
        </div>

        <h3>Stops</h3>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 150px 320px 290px",
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "8px 8px 0 0",
              border: "1px solid #e5e7eb",
              borderBottom: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
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
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 200px 230px 80px",
                    gap: 12,
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
                          updateStop(idx, "name", e.target.value)
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
                              idx,
                              "staySeconds",
                              val === "" ? "" : Math.max(0, parseInt(val) || 0)
                            );
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            updateStop(idx, "staySeconds", 0);
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
                              idx,
                              "betweenSeconds",
                              val === "" ? "" : Math.max(0, parseInt(val) || 0)
                            );
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            updateStop(idx, "betweenSeconds", 0);
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
                        onClick={() => removeStop(idx)}
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
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
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

                  <div style={{ width: 140 }}>
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

                  <div>
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
              Add Stop
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
              {saving ? "⏳ Updating..." : "Update Scenario"}
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

export default EditScenario;
