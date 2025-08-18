import React from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { 
  User, Stethoscope, Calendar, Users, Lock 
} from 'lucide-react';
import "./HospitalDashboard.css";


const HospitalDashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  }


  return (
    <>
    <nav>
        <Link to="/hospital-dashboard" className="logo">
          <img src="./src/img/logo.png" alt="Healthify" />
        </Link>
        <Link to="/hospital-dashboard" style={{ color: "aliceblue", textDecoration: "none" }}>
          <h1>Healthify</h1>
        </Link>
        <div id="trans">
        <button onClick={handleLogout} className="logout-btn">
      Logout
    </button>
        </div>
      </nav>
      <main>
        <div id="boxcontent">
          <div className="header-content">
            <h1>Healthify Hospital Dashboard</h1>
            <div className="header-buttons">
            <button onClick={() => navigate("/patient-management")} className="button">
              <User size={20} className="mr-2" />
              Patient Details
            </button>
            <button onClick={() => navigate("/doctor-management")} className="button">
              <Stethoscope size={20} className="mr-2" />
              Doctor Details
            </button>
            <button onClick={() => navigate("/appointment-management")} className="button">
              <Calendar size={20} className="mr-2" />
              Appointments
            </button>
            <button onClick={() => navigate("/staff-management")} className="button">
              <Users size={20} className="mr-2" />
              Staff Management
            </button>

            </div>
          </div>
          <div id="image" className="mt-8">
            <img 
              src="../src/img/doctor3.jpg" 
              alt="Healthify" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

        </div>
      </main>
    <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
      </>
  );
};

export default HospitalDashboard;
