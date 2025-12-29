import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import "../styles/Dashboard.css";

const PAGE_SIZES = [8, 12, 20];

// Delete Confirmation Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, userName, isDeleting }) => {
  if (!isOpen) return null;

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
          maxWidth: 480,
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
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 24,
            fontWeight: 700,
            color: "#1f2937",
            textAlign: "center",
          }}
        >
          Delete User?
        </h2>

        <p
          style={{
            margin: "0 0 28px",
            fontSize: 16,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: "#1f2937" }}>{userName}</strong>?
          <br />
          This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "12px 24px",
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              color: "#374151",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: isDeleting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#d1d5db";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1,
              padding: "12px 24px",
              border: "none",
              background: "#ef4444",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              color: "white",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.background = "#dc2626";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(239, 68, 68, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef4444";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isDeleting ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Deleting...
              </>
            ) : (
              <>
                <span>🗑️</span>
                Delete User
              </>
            )}
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

// Alert/Message Modal Component
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
              stroke="#10b981"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          bg: "#d1fae5",
          color: "#10b981",
        };
      case "error":
        return {
          icon: (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          ),
          bg: "#fee2e2",
          color: "#ef4444",
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
              stroke="#3b82f6"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          ),
          bg: "#dbeafe",
          color: "#3b82f6",
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

const ManageUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deletingUser, setDeletingUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZES[0]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (!user.isAdmin) {
          navigate("/dashboard");
        }
        setCurrentUserId(user._id || user.id || null);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await userAPI.getAllUsers();
      if (data.success && Array.isArray(data.users)) {
        const filtered = data.users.filter(
          (u) => (u._id || u.id) !== currentUserId
        );
        setUsers(filtered);
      } else {
        console.error("Failed to load users", data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const showMessage = (title, message, type = "info") => {
    setMessageModal({ isOpen: true, title, message, type });
  };

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, title: "", message: "", type: "info" });
  };

  const openDeleteModal = (userId, fullName) => {
    if (userId === currentUserId) {
      showMessage(
        "Action Not Allowed",
        "You cannot delete your own account while logged in.",
        "warning"
      );
      return;
    }
    setUserToDelete({ id: userId, name: fullName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!deletingUser) {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(userToDelete.id);
      const { data } = await userAPI.deleteUser(userToDelete.id);
      if (data.success) {
        setUsers((prev) =>
          prev.filter((u) => (u._id || u.id) !== userToDelete.id)
        );
        closeDeleteModal();
        setTimeout(() => {
          showMessage(
            "Success!",
            `User "${userToDelete.name}" has been deleted successfully.`,
            "success"
          );
        }, 200);
      } else {
        closeDeleteModal();
        setTimeout(() => {
          showMessage(
            "Delete Failed",
            data.message || "Failed to delete user. Please try again.",
            "error"
          );
        }, 200);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      closeDeleteModal();
      setTimeout(() => {
        showMessage(
          "Error",
          "Failed to delete user. Please check your connection and try again.",
          "error"
        );
      }, 200);
    } finally {
      setDeletingUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("scenarios");
    navigate("/");
  };

  const filteredUsers = useMemo(() => {
    if (query.trim() === "") return users;
    const q = query.toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      return fullName.includes(q) || email.includes(q);
    });
  }, [users, query]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
  const pagedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [query, perPage]);

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Manage Users</h1>
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
              onClick={() => navigate("/new-user")}
            >
              ➕ Create User
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

      <div className="dashboard-container">
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f8fafc",
                borderRadius: 10,
                padding: "10px 14px",
                flex: 1,
                maxWidth: 400,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                style={{ marginRight: 8 }}
              >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input
                placeholder="Search users by name or email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  flex: 1,
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: "#6b7280", fontSize: 14 }}>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
            </span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #e6e9ef",
                background: "#fff",
                fontSize: 14,
              }}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 200px 150px 100px",
              gap: 16,
              padding: "16px 20px",
              background: "#f8fafc",
              borderBottom: "1px solid #e5e7eb",
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <div>#</div>
            <div>Full Name</div>
            <div>Email</div>
            <div>Role</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {loadingUsers ? (
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
              Loading users...
            </div>
          ) : pagedUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ margin: "0 auto 16px", opacity: 0.5 }}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p style={{ margin: 0, fontSize: 16 }}>
                {query
                  ? `No users found matching "${query}"`
                  : "No users found"}
              </p>
            </div>
          ) : (
            <>
              {pagedUsers.map((u, idx) => {
                const fullName =
                  `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                  "No Name";
                return (
                  <div
                    key={u._id || u.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr 200px 150px 100px",
                      gap: 16,
                      padding: "16px 20px",
                      alignItems: "center",
                      borderBottom:
                        idx < pagedUsers.length - 1
                          ? "1px solid #f1f3f5"
                          : "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div style={{ fontWeight: 600, color: "#6b7280" }}>
                      {(page - 1) * perPage + idx + 1}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          color: "#1f2937",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fullName}
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.email}
                      </div>
                    </div>

                    <div>
                      {u.isAdmin ? (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                            color: "#856404",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Admin
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "#e5e7eb",
                            color: "#6b7280",
                          }}
                        >
                          User
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <button
                        onClick={() => openDeleteModal(u._id || u.id, fullName)}
                        disabled={deletingUser === (u._id || u.id)}
                        className="btn-delete"
                        style={{
                          padding: "8px 16px",
                          fontSize: 13,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                        title="Delete user"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {!loadingUsers && pagedUsers.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: "1px solid #e5e7eb",
                background: "#f8fafc",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                Showing {(page - 1) * perPage + 1} -{" "}
                {Math.min(page * perPage, filteredUsers.length)} of{" "}
                {filteredUsers.length}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: page === 1 ? "#f8fafc" : "#fff",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontSize: 14,
                  }}
                >
                  Previous
                </button>
                <div
                  style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}
                >
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: page === totalPages ? "#f8fafc" : "#fff",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    fontSize: 14,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        userName={userToDelete?.name}
        isDeleting={!!deletingUser}
      />

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        title={messageModal.title}
        message={messageModal.message}
        type={messageModal.type}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;
