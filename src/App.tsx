import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Home from "./Pages/Home";
import Cms from "./Pages/Cms";
import ArtifactDetails from "./Pages/ArtifactDetails";
import { Dashboard } from "./Pages/Dashboard";
import { EditCms } from "./Pages/EditCms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cms" element={<Cms />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/artifact/:id"
          element={<ArtifactDetails />}
        />
        <Route
          path="/edit/:id"
          element={<EditCms />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
