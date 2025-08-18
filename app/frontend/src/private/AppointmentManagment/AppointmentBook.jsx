import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import "./AppointmentManagement.css";

const AppointmentRegistration = ({ addAppointment }) => {
  const { register, handleSubmit, reset } = useForm();
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const onSubmit = async (data) => {
    try {
      // Get the token from local storage
      const token = localStorage.getItem("token");

      // Prepare the data according to the model
      const appointmentData = {
        patientNumber: data.patient, // Assuming 'patient' corresponds to 'patientNumber'
        doctorName: data.doctor, // Assuming 'doctor' corresponds to 'doctorName'
        date: data.date,
        time: data.time,
      };

      // Make an API call to register the appointment
      const response = await axios.post(
        `${API_BASE_URL}/appointment/`, // Replace with your API endpoint
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        }
      );

      // Assuming the response contains the newly created appointment
      addAppointment(response.data); // Update the appointment list with the new appointment
      alert("Appointment registered successfully!"); // Success alert
      reset(); // Reset form after submission
      navigate("/appointment-management"); // Redirect to appointment management page
    } catch (error) {
      console.error("Error registering appointment:", error);
      // Capture the error message from the response
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message); // Set the error message
      } else {
        setErrorMessage("Failed to register appointment. Please try again."); // Generic error message
      }
    }
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
          <Link to="/appointment-management">Back</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div className="card-header">
            <h3>Appointment Registration</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="form">
              <div className="form-group">
                <label>Doctor</label>
                <input {...register("doctor", { required: "Doctor is required" })} type="text" />
              </div>
              <div className="form-group">
                <label>Patient Number</label>
                <input {...register("patient", { required: "Patient number is required" })} type="text" />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input {...register("date", { required: "Date is required" })} type="date" />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input {...register("time", { required: "Time is required" })} type="time" />
              </div>
              {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error message */}
              <div className="form-actions">
                <button type="submit" className="submit-button">Register Appointment</button>
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

export default AppointmentRegistration;