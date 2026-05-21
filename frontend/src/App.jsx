import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ContractorDashboard from "./pages/ContractorDashboard.jsx";
import ContractorStats from "./pages/ContractorStats.jsx";
import BillPage from "./pages/BillPage.jsx";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.user);
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}

function App() {
  const { user } = useSelector((state) => state.user);

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            user.role === "STUDENT" ? (
              <Navigate to="/student-dashboard" replace />
            ) : (
              <Navigate to="/contractor-dashboard" replace />
            )
          ) : (
            <SignIn />
          )
        }
      />
      <Route path="/register" element={<SignUp />} />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor-dashboard"
        element={
          <ProtectedRoute allowedRoles={["MESS_CONTRACTOR", "CANTEEN_CONTRACTOR"]}>
            <ContractorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contractor-stats"
        element={
          <ProtectedRoute allowedRoles={["MESS_CONTRACTOR", "CANTEEN_CONTRACTOR"]}>
            <ContractorStats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bill"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <BillPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
