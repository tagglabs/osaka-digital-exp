import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Cms from "./Pages/Cms";
import ArtifactDetails from "./Pages/ArtifactDetails";
import { Dashboard } from "./Pages/Dashboard";
import EditCms from "./Pages/EditCms";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cms"
            element={
              <ProtectedRoute>
                <Cms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artifact/:id"
            element={<ArtifactDetails />}
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditCms />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
