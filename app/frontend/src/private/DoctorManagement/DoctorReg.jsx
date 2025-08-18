import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DoctorManagement.css";

const DoctorRegistration = () => {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const onSubmit = (data) => {
    const token = localStorage.getItem('token'); // Get the token from local storage
    axios.post(`${API_BASE_URL}/api/doctor`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log(response.data);
        reset(); // Reset form after submission
        navigate("/doctor-management"); // Redirect to doctor management page
      })
      .catch(error => {
        console.error('There was an error creating the doctor!', error);
      });
  };

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
          <Link to="/doctor-management">Back</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div className="card-header">
            <h3>Doctor Registration</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="form">
              <div className="form-group">
                <label>Doctor Name</label>
                <input {...register("name", { required: "Doctor name is required" })} type="text" />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input {...register("specialization", { required: "Specialization is required" })} type="text" />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">Register Doctor</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </>
  );
};

export default DoctorRegistration;
