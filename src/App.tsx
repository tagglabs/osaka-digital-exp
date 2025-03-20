import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Home from "./Pages/Home";
import CMS from "./Pages/CMS";
import ArtifactDetails from "./Pages/ArtifactDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cms" element={<CMS />} />
        <Route
          path="/artifact/:id"
          element={<ArtifactDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
