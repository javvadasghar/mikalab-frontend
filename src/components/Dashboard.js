import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal, MessageModal } from "./Modals";
import { scenarioAPI } from "../services/api";
import "../styles/Dashboard.css";
import config from "../config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [filteredScenarios, setFilteredScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState("User");
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: null,
  });

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    scenarioId: null,
    scenarioName: "",
    videoLoading: true,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const fullName =
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email || "User";
        setUserEmail(fullName);
        setIsAdmin(user.isAdmin || false);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    const cachedScenarios = localStorage.getItem("scenarios");
    if (cachedScenarios) {
      try {
        const parsed = JSON.parse(cachedScenarios);
        setScenarios(parsed);
        setFilteredScenarios(parsed);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing cached scenarios:", error);
      }
    }

    fetchScenarios();
    const interval = setInterval(() => fetchScenarios(true), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredScenarios(scenarios);
    } else {
      const filtered = scenarios.filter((scenario) =>
        scenario.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredScenarios(filtered);
    }
  }, [searchQuery, scenarios]);

  const showMessage = (title, message, type = "info") => {
    setMessageModal({ isOpen: true, title, message, type });
  };

  const showConfirm = (title, message, onConfirm, type = "warning") => {
    setConfirmModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, title: "", message: "", type: "info" });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      type: "warning",
      onConfirm: null,
    });
  };

  const openPreviewModal = (scenarioId, scenarioName) => {
    setPreviewModal({
      isOpen: true,
      scenarioId,
      scenarioName,
      videoLoading: true,
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      scenarioId: null,
      scenarioName: "",
      videoLoading: true,
    });
  };

  const fetchScenarios = async (isSilentRefresh = false) => {
    try {
      const { data } = await scenarioAPI.getAllScenarios();
      if (data.success) {
        setScenarios(data.scenarios);
        setFilteredScenarios(data.scenarios);
        localStorage.setItem("scenarios", JSON.stringify(data.scenarios));
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    } finally {
      if (!isSilentRefresh) {
        setLoading(false);
      }
    }
  };

  const handlePreviewVideo = (scenarioId, videoStatus, scenarioName) => {
    if (videoStatus !== "completed") {
      showMessage(
        "Video Not Ready",
        "Video is still being generated. Please wait a moment and try again.",
        "warning",
      );
      return;
    }
    openPreviewModal(scenarioId, scenarioName);
  };

  const handleDownloadVideo = async (scenarioId, videoStatus) => {
    if (videoStatus !== "completed") {
      showMessage(
        "Video Not Ready",
        "Video is still being generated. Please wait a moment and try again.",
        "warning",
      );
      return;
    }

    try {
      setDownloading(scenarioId);
      const blob = await scenarioAPI.downloadVideo(scenarioId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const scenario = scenarios.find((s) => s._id === scenarioId);
      const filename = scenario
        ? `${scenario.name}.mp4`
        : `scenario_${scenarioId}.mp4`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showMessage("Success!", "Video downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading video:", error);
      showMessage(
        "Download Failed",
        "Failed to download video. Please try again.",
        "error",
      );
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteScenario = async (scenarioId, scenarioName) => {
    showConfirm(
      "Delete Scenario?",
      `Are you sure you want to delete "${scenarioName}"?\n\nThis action cannot be undone and will also delete the associated video.`,
      async () => {
        try {
          setDeleting(scenarioId);

          const updatedScenarios = scenarios.filter(
            (s) => s._id !== scenarioId,
          );
          setScenarios(updatedScenarios);
          setFilteredScenarios(
            filteredScenarios.filter((s) => s._id !== scenarioId),
          );
          localStorage.setItem("scenarios", JSON.stringify(updatedScenarios));

          showMessage(
            "Deleting...",
            "Scenario is being deleted. This may take a moment.",
            "info",
          );

          const { data } = await scenarioAPI.deleteScenario(scenarioId);

          if (data.success) {
            closeMessageModal();
            setTimeout(() => {
              showMessage(
                "Deleted!",
                "Scenario deleted successfully!",
                "success",
              );
            }, 100);
          } else {
            setScenarios(scenarios);
            setFilteredScenarios(filteredScenarios);
            localStorage.setItem("scenarios", JSON.stringify(scenarios));

            closeMessageModal();
            setTimeout(() => {
              showMessage(
                "Error",
                data.message || "Failed to delete scenario",
                "error",
              );
            }, 100);
          }
        } catch (error) {
          console.error("Error deleting scenario:", error);

          setScenarios(scenarios);
          setFilteredScenarios(filteredScenarios);
          localStorage.setItem("scenarios", JSON.stringify(scenarios));

          closeMessageModal();
          setTimeout(() => {
            showMessage(
              "Error",
              "Failed to delete scenario. Please try again.",
              "error",
            );
          }, 100);
        } finally {
          setDeleting(null);
        }
      },
      "danger",
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("scenarios");
    navigate("/");
  };

  const getVideoStatusBadge = (status) => {
    const badges = {
      pending: { text: "⏳ Pending", color: "#9ca3af" },
      generating: { text: "🔄 Generating", color: "#38bdf8" },
      completed: { text: "✅ Ready", color: "#34d399" },
      failed: { text: "❌ Failed", color: "#f87171" },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        style={{
          fontSize: "12px",
          padding: "4px 10px",
          borderRadius: "12px",
          backgroundColor: badge.color,
          color: "white",
          fontWeight: "600",
        }}
      >
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleExportToCSV = () => {
    if (scenarios.length === 0) {
      showMessage("No Data", "No scenarios available to export", "warning");
      return;
    }

    try {
      const headers = [
        "Scenario Name",
        "Stop Name",
        "Travel Time to Next Stop (sec)",
        "Stay Time at Stop (sec)",
        "Created By",
        "Created At",
        "Updated By",
        "Last Updated At",
        "Emergency Description",
        "Emergency Interrupt At (sec)",
        "Emergency Duration (sec)",
      ];

      const rows = [];
      scenarios.forEach((scenario) => {
        scenario.stops.forEach((stop, index) => {
          const hasEmergencies =
            stop.emergencies &&
            Array.isArray(stop.emergencies) &&
            stop.emergencies.length > 0;

          if (hasEmergencies) {
            stop.emergencies.forEach((emergency) => {
              const row = [
                `"${scenario.name}"`,
                `"${stop.name}"`,
                stop.travelTimeToNextStop || 0,
                stop.stayTimeAtStop || 0,
                `"${scenario.createdByName || "Unknown"}"`,
                scenario.createdAt ? formatDate(scenario.createdAt) : "N/A",
                `"${scenario.updatedByName || "Unknown"}"`,
                scenario.lastUpdatedAt
                  ? formatDate(scenario.lastUpdatedAt)
                  : "",
                `"${emergency.text || ""}"`,
                emergency.startSecond || 0,
                emergency.seconds || 0,
              ];
              rows.push(row.join(","));
            });
          } else {
            const row = [
              `"${scenario.name}"`,
              `"${stop.name}"`,
              stop.travelTimeToNextStop || 0,
              stop.stayTimeAtStop || 0,
              `"${scenario.createdByName || "Unknown"}"`,
              scenario.createdAt ? formatDate(scenario.createdAt) : "N/A",
              `"${scenario.updatedByName || "Unknown"}"`,
              scenario.lastUpdatedAt ? formatDate(scenario.lastUpdatedAt) : "",
              "",
              "",
              "",
            ];
            rows.push(row.join(","));
          }
        });
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scenarios_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showMessage(
        "Success!",
        `Exported ${scenarios.length} scenario(s) to CSV successfully!`,
        "success",
      );
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      showMessage(
        "Export Failed",
        "Failed to export scenarios to CSV. Please try again.",
        "error",
      );
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">
              Welcome {userEmail}
              {isAdmin && (
                <span
                  style={{
                    fontSize: "14px",
                    marginLeft: "10px",
                    padding: "4px 12px",
                    backgroundColor: "rgba(255,215,0,0.3)",
                    borderRadius: "8px",
                    color: "#ffd700",
                  }}
                >
                  Admin
                </span>
              )}
            </h1>
          </div>
          <div className="header-right">
            <div className="search-container">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6b7280"
                strokeWidth="2"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="btn-export-csv"
              onClick={handleExportToCSV}
              disabled={scenarios.length === 0}
              title="Export all scenarios to CSV"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export Scenarios
            </button>

            <button
              className="btn-new-scenario"
              onClick={() => navigate("/create-scenario")}
            >
              Create Scenario
            </button>

            {isAdmin && (
              <button
                className="btn-new-scenario"
                onClick={() => navigate("/manage-users")}
                title="Manage users"
                style={{ marginLeft: 8 }}
              >
                Manage Users
              </button>
            )}

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

      <div className="dashboard-container">
        <div className="scenarios-section">
          <h2>Scenarios</h2>
          {loading && scenarios.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                color: "#6b7280",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "4px solid #e5e7eb",
                  borderTopColor: "#38bdf8",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "20px",
                }}
              ></div>
              <p style={{ fontSize: "16px", margin: 0 }}>
                Loading scenarios...
              </p>
            </div>
          ) : filteredScenarios.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#6b7280",
              }}
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ margin: "0 auto 20px", opacity: 0.5 }}
              >
                <path d="M9 11H3v2h6m-6-6h6m-6 8h6m-6 4h6M13 9h8M13 15h8m-8 4h8m-8-8h8"></path>
              </svg>
              <p style={{ fontSize: "16px", margin: 0 }}>
                {searchQuery
                  ? `No scenarios found matching "${searchQuery}"`
                  : "No scenarios found. Create your first scenario!"}
              </p>
            </div>
          ) : (
            <div className="scenarios-grid">
              {filteredScenarios.map((scenario) => (
                <div
                  key={scenario._id}
                  className="scenario-card"
                  style={{
                    opacity:
                      scenario.videoStatus === "generating" ||
                      scenario.videoStatus === "pending"
                        ? 0.7
                        : 1,
                    pointerEvents:
                      scenario.videoStatus === "generating" ||
                      scenario.videoStatus === "pending"
                        ? "none"
                        : "auto",
                    transition: "opacity 0.3s ease",
                  }}
                >
                  {(scenario.videoStatus === "generating" ||
                    scenario.videoStatus === "pending") && (
                    <div className="video-generating-banner">
                      <div className="marquee">
                        <span className="marquee-content">
                          🎬 Video is being generated... Please wait... Video processing in progress... 🎬 Video is being generated... Please wait... Video processing in progress... 🎬
                        </span>
                      </div>
                    </div>
                  )}
                  <div 
                    className="scenario-header"
                    style={{
                      marginTop: (scenario.videoStatus === "generating" || scenario.videoStatus === "pending") ? "35px" : "0"
                    }}
                  >
                    <h3>{scenario.name}</h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "10px",
                      }}
                    >
                      {getVideoStatusBadge(scenario.videoStatus)}
                      <div className="scenario-info-icon">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div className="scenario-tooltip">
                          <div className="tooltip-section">
                            <div className="tooltip-label">Created By</div>
                            <div className="tooltip-value">
                              {scenario.createdByName || "Unknown"} on{" "}
                              {formatDate(scenario.createdAt)}
                            </div>
                          </div>
                          {scenario.lastUpdatedAt && (
                            <>
                              <div className="tooltip-divider"></div>
                              <div className="tooltip-section">
                                <div className="tooltip-label">
                                  Last Updated By
                                </div>
                                <div className="tooltip-value">
                                  {scenario.updatedByName || "Unknown"} on{" "}
                                  {formatDate(scenario.lastUpdatedAt)}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="scenario-details">
                    <p>
                      <strong>Stops:</strong> {scenario.stops.length}
                    </p>
                    <div className="stops-list">
                      {scenario.stops.map((stop, index) => (
                        <div key={index} className="stop-item">
                          <span className="stop-number">{index + 1}</span>
                          <span className="stop-name">{stop.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="scenario-actions">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/edit-scenario/${scenario._id}`)}
                      disabled={deleting === scenario._id}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-preview"
                      onClick={() =>
                        handlePreviewVideo(
                          scenario._id,
                          scenario.videoStatus,
                          scenario.name,
                        )
                      }
                      disabled={
                        scenario.videoStatus !== "completed" ||
                        deleting === scenario._id
                      }
                    >
                      Preview
                    </button>
                    <button
                      className="btn-download"
                      onClick={() =>
                        handleDownloadVideo(scenario._id, scenario.videoStatus)
                      }
                      disabled={
                        downloading === scenario._id ||
                        scenario.videoStatus !== "completed" ||
                        deleting === scenario._id
                      }
                    >
                      {downloading === scenario._id
                        ? "Downloading..."
                        : "Download"}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDeleteScenario(scenario._id, scenario.name)
                      }
                      disabled={deleting === scenario._id}
                      title="Delete scenario"
                    >
                      {deleting === scenario._id ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {previewModal.isOpen && (
        <div className="modal-overlay" onClick={closePreviewModal}>
          <div
            className="modal-video-preview"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{previewModal.scenarioName}</h2>
              <button className="modal-close" onClick={closePreviewModal}>
                ✕
              </button>
            </div>
            <div className="modal-body-video">
              {previewModal.videoLoading && (
                <div className="video-loading-overlay">
                  <div className="video-loading-spinner"></div>
                  <p>Loading video...</p>
                </div>
              )}
              <video
                controls
                autoPlay
                preload="auto"
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  display: previewModal.videoLoading ? "none" : "block",
                }}
                key={previewModal.scenarioId}
                onLoadedData={(e) => {
                  setPreviewModal((prev) => ({ ...prev, videoLoading: false }));
                  e.target
                    .play()
                    .catch((err) => console.log("Auto-play prevented:", err));
                }}
                onCanPlay={(e) => {
                  e.target
                    .play()
                    .catch((err) => console.log("Auto-play prevented:", err));
                }}
              >
                <source
                  src={`${config.API_BASE_URL}/scenario/${
                    previewModal.scenarioId
                  }/video/preview?token=${localStorage.getItem("token")}&t=${Date.now()}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-download"
                onClick={() => {
                  handleDownloadVideo(previewModal.scenarioId, "completed");
                }}
              >
                Download Video
              </button>
              <button className="btn-modal-close" onClick={closePreviewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Dashboard;
