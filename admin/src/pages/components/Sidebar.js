import {
  HiOutlineHome,
  HiOutlinePhotograph,
  HiOutlineBell,
  HiOutlineQuestionMarkCircle,
  HiOutlineNewspaper,
  HiOutlineAcademicCap,
  HiOutlineLogout,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate("/dashboard")}>
        <span>MIS Dashboard</span>
      </div>

      <div className="sidebar-section">
        <p className="section-title">Home MIS</p>

        <button type="button" onClick={() => navigate("/banners")}>
          <span>Banners</span>
        </button>

        <button type="button" onClick={() => navigate("/vice")}>
          <span>Vice</span>
        </button>

        <button type="button" onClick={() => navigate("/mission")}>
          <span>Mission</span>
        </button>

        <button type="button" onClick={() => navigate("/success")}>
          <span>Our Success</span>
        </button>

        <button type="button" onClick={() => navigate("/cafe")}>
          <span>Cafeteria</span>
        </button>

      </div>

      <div className="sidebar-section">
        <p className="section-title">Programs</p>

        <button type="button" onClick={() => navigate("/calendar")}>
          <span>Calendar</span>
        </button>

        <button type="button" onClick={() => navigate("/activities")}>
          <span>Activities</span>
        </button>

        <button type="button" onClick={() => navigate("/special")}>
          <span>Special</span>
        </button>

        <button type="button" onClick={() => navigate("/volunteer")}>
          <span>Volunteer</span>
        </button>

      </div>

      <div className="sidebar-section">
        <p className="section-title">Admissions</p>

        <button type="button" onClick={() => navigate("/process")}>
          Process
        </button>

        <button type="button" onClick={() => navigate("/application")}>
          Online Admission
        </button>
        
        <button type="button" onClick={() => navigate("/tuition")}>
          Tuition
        </button>
      </div>

      <div className="sidebar-section">
        <p className="section-title">Information</p>

        <button type="button" onClick={() => navigate("/news")}>
          News
        </button>


        <button type="button" onClick={() => navigate("/questions")}>
          Questions
        </button>

        <button type="button" onClick={() => navigate("/contact")}>
          Contact
        </button>

      </div>



      <div className="sidebar-footer">
        <button
          type="button"
          className="logout"
          onClick={() => navigate("/login")}
        >
          <HiOutlineLogout />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
