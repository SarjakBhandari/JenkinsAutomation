import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import './Home.css';

const index = () => {
  return (
    <Fragment>
      <nav>
        <Link to="/" className="logo">
          <img src="..\src\img\logo.png" alt="Healthify" />
        </Link>
        <Link to="/" style={{ color: "aliceblue", textDecoration: "none" }}>
          <h1>Healthify</h1>
        </Link>
        <div id="trans">
          <Link to="/login">Login</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>
      <div id="subnav">
        <Link to="/login">Login</Link>
        <Link to="/about">About</Link>
      </div>
      <main>
        <div id="boxcontent">
          <div className="header-content">
            <h1>Welcome to Healthify</h1>
            <p>
              A compact Appointment Booking system <br />
              with doctor, patient, staff management for <br /> Hospitals,
              Clinics and Dentals.
            </p>
            <div className="header-buttons">
              <Link to="/register" className="btn">
                <button className="button">Get Started</button>
              </Link>
              <Link to="/login" className="btn">
                <button className="button">Sign In</button>
              </Link>
            </div>
          </div>
          <div id="image">
            <img src="../src/img/doctor3.jpg" alt="Healthify" />
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </Fragment>
  );
};

export default index;
