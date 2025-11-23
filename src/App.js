import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CreateScenario from "./components/CreateScenario";
import ProtectedRoute from "./components/ProtectedRoute";
import EditScenario from "./components/EditScenerio";
import NewUser from "./components/NewUser";
import ManageUsers from "./components/ManageUsers";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-scenario"
            element={
              <ProtectedRoute>
                <CreateScenario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-scenario/:id"
            element={
              <ProtectedRoute>
                <EditScenario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-user"
            element={
              <ProtectedRoute>
                <NewUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
