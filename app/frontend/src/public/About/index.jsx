import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <>
      <nav>
        <Link to="/" className="logo">
          <img src="../src/img/logo.png" alt="Healthify" />
        </Link>
        <Link to="/" style={{ color: "aliceblue", textDecoration: "none" }}>
          <h1>Healthify</h1>
        </Link>
        <div id="trans">
          <Link to="/login">Login</Link>
          <Link to="/">Home</Link>
        </div>
      </nav>
      <div id="subnav">
        <Link to="/login">Login</Link>
        <Link to="/">Home</Link>
      </div>
      <main>
        <div className="box-content">
          <p>
            
          </p>
        </div>
        <div id="boxcontent">
          <div className="header-content">
            <h2>About Healthify</h2>
            <p>
              Healthify is a comprehensive hospital management system that helps you manage your hospital efficiently. <br/>
              From patient registration to appointment booking, staff management to doctor allocation, Healthify has got you covered.<br/>
              Our mission is to streamline hospital operations and enhance patient care through innovative technology. 
            With Healthify, you can easily manage appointments, track patient records, and ensure efficient staff coordination.
            We provide real-time analytics and reporting to help hospitals make data-driven decisions.
            </p>
          </div>
          <div id="image">
            <img src="../src/img/hospital.jpg" alt="Healthify" />
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </>
  );
};

export default About;
