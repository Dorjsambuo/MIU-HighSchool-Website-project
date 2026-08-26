import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar"; // adjust if needed

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
