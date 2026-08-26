import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Banners from "./pages/Banners";
import Events from "./pages/Events";
import PrivateRoute from "./pages/PrivateRoute";
import Login from "./pages/Login";


function Main() {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<div>Select a section from the sidebar</div>} />
          <Route path="banners" element={<Banners />} />
          <Route path="events" element={<Events />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default Main;
