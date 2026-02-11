import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageModal } from "./Modals";
import { scenarioAPI } from "../services/api";
import "../styles/CreateScenario.css";
import "../styles/Dashboard.css";

const defaultStop = (id) => ({
  id: id || Date.now(),
  name: "",
  travelTimeToNextStop: 30,
  stayTimeAtStop: 0,
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

const calculateTotalSeconds = (stops) => {
  return stops.reduce((total, stop, index) => {
    const isLastStop = index === stops.length - 1;
    const travel = isLastStop ? 0 : Number(stop.travelTimeToNextStop) || 0;
    const stay = isLastStop ? 0 : Number(stop.stayTimeAtStop) || 0;
    const emergencies = Array.isArray(stop.emergencies)
      ? stop.emergencies.reduce((sum, e) => sum + (Number(e.seconds) || 0), 0)
      : 0;
    return total + travel + stay + emergencies;
  }, 0);
};

const transformStopForAPI = (stop) => ({
  name: stop.name,
  travelTimeToNextStop: Number(stop.travelTimeToNextStop) || 0,
  stayTimeAtStop: Number(stop.stayTimeAtStop) || 0,
  emergencyEnabled: !!(stop.emergencies && stop.emergencies.length > 0),
  emergencySeconds: Number(stop.emergencies?.[0]?.seconds) || 0,
  emergencies: (stop.emergencies || []).map((e) => ({
    text: e.text || "",
    startSecond: Number(e.startSecond) || 0,
    seconds: Number(e.seconds) || 0,
  })),
});

const updateCachedScenarios = (scenario, isEdit = false, scenarioId = null) => {
  const cached = localStorage.getItem("scenarios");
  if (!cached) return;

  try {
    const scenarios = JSON.parse(cached);
    if (isEdit) {
      const updated = scenarios.map((s) =>
        s._id === scenarioId ? scenario : s,
      );
      localStorage.setItem("scenarios", JSON.stringify(updated));
    } else {
      scenarios.unshift(scenario);
      localStorage.setItem("scenarios", JSON.stringify(scenarios));
    }
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

const useModal = () => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const show = (title, message, type = "info") => {
    setModal({ isOpen: true, title, message, type });
  };

  const close = () => {
    setModal({ isOpen: false, title: "", message: "", type: "info" });
  };

  return { modal, show, close };
};

const ScenarioForm = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === "edit" || !!id;
  const { modal, show: showMessage, close: closeMessageModal } = useModal();

  const [scenarioName, setScenarioName] = useState("");
  const [theme, setTheme] = useState("dark");
  const [stops, setStops] = useState(
    isEditMode
      ? [defaultStop(1)]
      : [defaultStop(1), defaultStop(2), defaultStop(3)],
  );
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emergencyError, setEmergencyError] = useState("");
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    if (isEditMode && id) {
      fetchScenario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  useEffect(() => {
    setTotalSeconds(calculateTotalSeconds(stops));
  }, [stops]);

  const fetchScenario = async () => {
    try {
      setLoading(true);
      const { data } = await scenarioAPI.getScenarioById(id);

      if (data.success && data.scenario) {
        setScenarioName(data.scenario.name || "");
        setTheme(data.scenario.theme || "dark");

        const mapped = (data.scenario.stops || []).map((stop, i) => ({
          id: i,
          name: stop.name || `Stop ${i + 1}`,
          travelTimeToNextStop: Math.max(20, stop.travelTimeToNextStop ?? 30),
          stayTimeAtStop: stop.stayTimeAtStop ?? 0,
          emergencies: Array.isArray(stop.emergencies)
            ? stop.emergencies.map((e) => ({
                text: e.text || "",
                startSecond: e.startSecond ?? 0,
                seconds: e.seconds ?? 0,
              }))
            : [],
        }));

        setStops(mapped.length ? mapped : [defaultStop(1)]);
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

  const updateStop = (stopId, field, value) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId ? { ...stop, [field]: value } : stop,
      ),
    );
  };

  const addStop = () => setStops((prev) => [...prev, defaultStop(Date.now())]);

  const removeStop = (stopId) => {
    if (stops.length > 1) {
      setStops((prev) => prev.filter((stop) => stop.id !== stopId));
    }
  };

  const hasAnyEmergency = stops.some((s) => s.emergencies?.length > 0);

  const addEmergency = (index) => {
    if (hasAnyEmergency) return;

    setStops((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              emergencies: [
                ...s.emergencies,
                { text: "", startSecond: 0, seconds: 10 },
              ],
            }
          : s,
      ),
    );
  };

  const updateEmergency = (stopIndex, emergencyIndex, field, value) => {
    setStops((prev) =>
      prev.map((stop, i) => {
        if (i !== stopIndex) return stop;

        return {
          ...stop,
          emergencies: stop.emergencies.map((emergency, ei) => {
            if (ei !== emergencyIndex) return emergency;
            if (value === "") {
              return {
                ...emergency,
                [field]: "",
              };
            }
            const numValue = Math.max(0, Number(value || 0));
            if (field === "seconds" || field === "startSecond") {
              const updatedEmergency = {
                ...emergency,
                [field]: numValue,
              };
              const interruptAt =
                field === "startSecond"
                  ? numValue
                  : updatedEmergency.startSecond;
              const duration =
                field === "seconds"
                  ? Math.max(10, numValue)
                  : updatedEmergency.seconds;

              if (interruptAt + duration > totalSeconds) {
                setEmergencyError(
                  `Emergency cannot exceed scenario duration. Total: ${totalSeconds}s, Current: ${interruptAt + duration}s`,
                );
                setTimeout(() => setEmergencyError(""), 5000);
                return emergency;
              }

              if (interruptAt >= totalSeconds) {
                setEmergencyError(
                  `Interrupt time must be less than total duration (${totalSeconds}s)`,
                );
                setTimeout(() => setEmergencyError(""), 5000);
                return emergency;
              }
              setEmergencyError("");
              return updatedEmergency;
            }

            return {
              ...emergency,
              [field]: value,
            };
          }),
        };
      }),
    );
  };

  const removeEmergency = (stopIndex, emergencyIndex) => {
    setStops((prev) =>
      prev.map((stop, i) =>
        i === stopIndex
          ? {
              ...stop,
              emergencies: stop.emergencies.filter(
                (_, ei) => ei !== emergencyIndex,
              ),
            }
          : stop,
      ),
    );
  };

  const validateForm = () => {
    if (!scenarioName.trim()) {
      setError("Please enter a scenario name");
      return false;
    }

    if (stops.some((stop) => !stop.name.trim())) {
      setError("Please enter names for all stops");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage(
        "Authentication Required",
        "Authentication token not found. Please login again.",
        "error",
      );
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: scenarioName,
        theme,
        stops: stops.map(transformStopForAPI),
      };

      const { response, data } = isEditMode
        ? await scenarioAPI.updateScenario(id, payload)
        : await scenarioAPI.createScenario(payload);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showMessage(
          "Session Expired",
          "Your session has expired. Please login again.",
          "error",
        );
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (data.success) {
        updateCachedScenarios(data.scenario, isEditMode, id);

        if (isEditMode) {
          const message = data.videoRegenerated
            ? "Scenario updated successfully!\n\nVideo will be regenerated due to changes in stops."
            : "Scenario updated successfully!\n\nVideo remains unchanged.";
          showMessage("Updated Successfully!", message, "success");
        } else {
          showMessage(
            "Success!",
            "Scenario created successfully!\n\nVideo is being generated and will be available shortly.",
            "success",
          );
        }
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        const action = isEditMode ? "update" : "create";
        setError(data.message || `Failed to ${action} scenario`);
        showMessage(
          `${isEditMode ? "Update" : "Creation"} Failed`,
          data.message || `Failed to ${action} scenario. Please try again.`,
          "error",
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} scenario:`,
        error,
      );
      const action = isEditMode ? "update" : "create";
      setError(`Failed to ${action} scenario. Please try again.`);
      showMessage(
        "Error",
        `Failed to ${action} scenario. Please try again.`,
        "error",
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

  // ============ RENDER HELPERS ============
  const renderNumberInput = (
    value,
    onChange,
    onBlur,
    placeholder,
    isRequired = true,
    minValue = 0,
  ) => (
    <input
      type="number"
      min={minValue}
      max="999"
      step="1"
      placeholder={placeholder}
      value={value}
      onKeyDown={(e) => {
        if (
          e.key === "." ||
          e.key === "," ||
          e.key === "e" ||
          e.key === "E" ||
          e.key === "-" ||
          e.key === "+"
        ) {
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        const pastedData = e.clipboardData.getData("text");
        if (!/^\d+$/.test(pastedData)) {
          e.preventDefault();
        }
      }}
      onChange={(e) => {
        const val = e.target.value.replace(/^0+/, "") || "";
        if (
          val === "" ||
          (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 999)
        ) {
          onChange(val === "" ? "" : parseInt(val) || "");
        }
      }}
      onBlur={(e) => {
        const val = e.target.value;
        if (val === "" || Number(val) < minValue) {
          onBlur(minValue);
        } else {
          onBlur(Math.min(999, Math.max(minValue, parseInt(val) || minValue)));
        }
      }}
      required={isRequired}
    />
  );

  const renderEmergencyInput = (
    label,
    type,
    value,
    onChange,
    placeholder,
    title,
    minValue = 0,
  ) => (
    <div
      style={{
        width: type === "text" ? undefined : 160,
        flex: type === "text" ? 1 : undefined,
      }}
    >
      <label style={{ color: "#92400e", display: "block", marginBottom: 2 }}>
        {label}
      </label>
      <input
        type={type}
        min={type === "number" ? minValue : undefined}
        max={type === "number" ? "999" : undefined}
        maxLength={type === "text" ? 50 : undefined}
        placeholder={placeholder}
        value={value}
        onKeyDown={
          type === "number"
            ? (e) => {
                if (
                  e.key === "." ||
                  e.key === "," ||
                  e.key === "e" ||
                  e.key === "E" ||
                  e.key === "-" ||
                  e.key === "+"
                ) {
                  e.preventDefault();
                }
              }
            : undefined
        }
        onPaste={
          type === "number"
            ? (e) => {
                const pastedData = e.clipboardData.getData("text");
                if (!/^\d+$/.test(pastedData)) {
                  e.preventDefault();
                }
              }
            : undefined
        }
        onChange={
          type === "number"
            ? (e) => {
                const val = e.target.value.replace(/^0+/, "") || "";
                if (
                  val === "" ||
                  (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 999)
                ) {
                  const processedVal = val === "" ? "" : parseInt(val) || "";
                  onChange({ target: { value: processedVal.toString() } });
                }
              }
            : onChange
        }
        onBlur={
          type === "number"
            ? (e) => {
                const val = e.target.value;
                if (val === "" || Number(val) < minValue) {
                  const newVal = minValue;
                  onChange({ target: { value: newVal.toString() } });
                } else {
                  const clampedVal = Math.min(
                    999,
                    Math.max(minValue, parseInt(val) || minValue),
                  );
                  onChange({ target: { value: clampedVal.toString() } });
                }
              }
            : undefined
        }
        style={{
          width: "100%",
          padding: 8,
          border: "1px solid #fbbf24",
          borderRadius: 6,
        }}
        title={title}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid #f3f4f6",
              borderTopColor: "#5865f2",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: 16 }}>Loading scenario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">
              {isEditMode ? "Edit Scenario" : "New Scenario"}
            </h1>
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

      <div
        className="scenario-form"
        style={{
          opacity: saving ? 0.5 : 1,
          pointerEvents: saving ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
      >
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
            gap: 12,
          }}
        >
          <div className="input-group" style={{ flex: 1 }}>
            <label style={{ marginBottom: 2 }}>
              <b> Scenario Name</b>
            </label>
            <input
              type="text"
              placeholder="Enter the Scenario Name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="input-group" style={{ width: 200, marginTop: 20 }}>
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
          <div style={{ overflowX: "auto" }}>
            <div
              className="table-header"
              style={{
                display: "flex",
                padding: "12px",
                minWidth: "650px",
                background: "#f8fafc",
                borderRadius: "8px 8px 0 0",
                border: "1px solid #e5e7eb",
                borderBottom: "none",
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                gap: 12,
              }}
            >
              <div style={{ flex: 2, minWidth: 200 }}>
                Stop Name <span style={{ color: "#ef4444" }}>*</span>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                Travel Time to Next Stop (sec){" "}
                <span style={{ color: "#ef4444" }}>*</span>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                Stay Time at Stop (sec){" "}
                <span style={{ color: "#ef4444" }}>*</span>
              </div>
              <div style={{ width: 80 }}></div>
            </div>

            {stops.map((stop, idx) => (
              <React.Fragment key={stop.id}>
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
                    className="stop-grid"
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 2, minWidth: 200 }}>
                      <div className="stop-input">
                        <input
                          type="text"
                          placeholder="e.g., Ilmenau Politzer Höhe"
                          value={stop.name}
                          onChange={(e) =>
                            updateStop(stop.id, "name", e.target.value)
                          }
                          maxLength={30}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 120 }}>
                      {idx === stops.length - 1 ? (
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: 14,
                            fontStyle: "italic",
                            padding: 8,
                          }}
                        >
                          N/A
                        </div>
                      ) : (
                        <div className="stop-input">
                          {renderNumberInput(
                            stop.travelTimeToNextStop,
                            (val) =>
                              updateStop(stop.id, "travelTimeToNextStop", val),
                            (val) =>
                              updateStop(stop.id, "travelTimeToNextStop", val),
                            "30",
                            true,
                            30,
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 150 }}>
                      {idx === stops.length - 1 ? (
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: 14,
                            fontStyle: "italic",
                            padding: 8,
                          }}
                        >
                          N/A
                        </div>
                      ) : (
                        <div className="stop-input">
                          {renderNumberInput(
                            stop.stayTimeAtStop,
                            (val) => updateStop(stop.id, "stayTimeAtStop", val),
                            (val) => updateStop(stop.id, "stayTimeAtStop", val),
                            "30",
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 4, width: 80 }}>
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
                </div>
              </React.Fragment>
            ))}
          </div>

          {stops.some((stop) => stop.emergencies?.length > 0) && (
            <div style={{ marginBottom: 12 }}>
              {stops.map((stop, idx) =>
                (stop.emergencies || []).map((em, ei) => (
                  <div
                    key={`em-${idx}-${ei}`}
                    style={{
                      padding: 12,
                      border: "1px solid #f3a683",
                      borderRadius: "8px",
                      background: "#fffaf0",
                      marginBottom: 12,
                    }}
                  >
                    {idx === 0 && ei === 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#92400e",
                          marginBottom: 8,
                          padding: "6px 10px",
                          background: "#fef3c7",
                          borderRadius: 4,
                          border: "1px solid #fbbf24",
                        }}
                      >
                        💡 <strong>Note:</strong> Emergency interrupts the video
                        at your chosen time and adds extra seconds. The video
                        then continues from where it paused.
                      </div>
                    )}
                    <div
                      className="emergency-grid"
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      {renderEmergencyInput(
                        "Emergency description",
                        "text",
                        em.text,
                        (e) => updateEmergency(idx, ei, "text", e.target.value),
                        "e.g., Fire Ahead",
                        undefined,
                      )}

                      {renderEmergencyInput(
                        "Interrupt At (sec)",
                        "number",
                        em.startSecond,
                        (e) =>
                          updateEmergency(
                            idx,
                            ei,
                            "startSecond",
                            e.target.value,
                          ),
                        "120",
                        "Time in video when emergency interrupts and displays",
                      )}

                      {renderEmergencyInput(
                        "Display Duration (sec)",
                        "number",
                        em.seconds,
                        (e) =>
                          updateEmergency(idx, ei, "seconds", e.target.value),
                        "10",
                        "How long the emergency message displays before video resumes",
                        10,
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: 18,
                          width: 80,
                        }}
                      >
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
                    {emergencyError && (
                      <div
                        style={{
                          padding: "10px 12px",
                          backgroundColor: "#fee2e2",
                          color: "#dc2626",
                          borderRadius: "6px",
                          marginTop: "8px",
                          border: "1px solid #fca5a5",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        ⚠️ {emergencyError}
                      </div>
                    )}
                  </div>
                )),
              )}
            </div>
          )}

          {!hasAnyEmergency && (
            <div
              style={{
                margin: "12px 0",
                display: "flex",
                justifyContent: "right",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  addEmergency(0);
                }}
                style={{
                  position: "relative",
                  background: "#f87171",
                  color: "white",
                  border: "3px solid #dc2626",
                  padding: "12px 24px",
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
            </div>
          )}

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
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update"
                  : "Create"}
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

      <MessageModal
        isOpen={modal.isOpen}
        onClose={closeMessageModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default ScenarioForm;
