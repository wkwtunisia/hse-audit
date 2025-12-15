import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import App from "./App.jsx"; // Login page
import AuditForm from "./AuditForm.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import { supabase } from "./supabaseClient";
import "./styles.css";

// Reusable Protected Route with role check
function ProtectedRoute({ children, requiredRole = "user" }) {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    const checkAuthAndRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const role = session.user.app_metadata?.role || "user";

      if (requiredRole === "admin" && role !== "admin") {
        setAllowed(false);
      } else {
        setAllowed(true);
      }
      setLoading(false);
    };

    checkAuthAndRole();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setAllowed(false);
        } else if (session) {
          const role = session.user.app_metadata?.role || "user";
          setAllowed(!(requiredRole === "admin" && role !== "admin"));
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [requiredRole]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f4f8",
        }}
      >
        <p style={{ fontSize: "18px", color: "#1e3c72" }}>Loading...</p>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

// Main App with Routes
function Root() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<App />} />

        {/* Audit Form - Accessible to both user and admin */}
        <Route
          path="/form"
          element={
            <ProtectedRoute requiredRole="user">
              <AuditForm />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard - Only for admins */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback: Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
