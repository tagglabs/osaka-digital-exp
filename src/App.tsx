import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Home from "./Pages/Home";
import Cms from "./Pages/Cms";
import ArtifactDetails from "./Pages/ArtifactDetails";
import { Dashboard } from "./Pages/Dashboard";
import EditCms from "./Pages/EditCms";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
