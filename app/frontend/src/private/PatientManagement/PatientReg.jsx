import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "./PatientManagement.css";

const PatientRegistration = ({ addPatient }) => {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const token = localStorage.getItem("token"); // Retrieve token from local storage

    try {
      const response = await fetch(`${API_BASE_URL}/patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Use the token from local storage
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to register patient");
      }

      const responseData = await response.json();
      addPatient(responseData); // Update the patient list
      alert("Patient registered successfully!");
      reset(); // Reset form after submission
      navigate("/patient-management"); // Redirect to patient management page
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to register patient: " + error.message);
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
          <Link to="/patient-management">Back</Link>
        </div>
      </nav>

      <div className="container">
        <div className="card">
          <div className="card-header">
            <h3>Patient Registration</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="form">
              <div className="form-group">
                <label>Patient Name</label>
                <input {...register("name", { required: "Patient name is required" })} type="text" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input {...register("phone", { required: "Number is required" })} type="number" />
              </div>
              <div className="form-group">
                <label>Disease</label>
                <input {...register("disease", { required: "Disease is required" })} type="text" />
                <label>Address</label>
                <input {...register("address", { required: "Address is required" })} type="text" />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">Register Patient</button>
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

export default PatientRegistration;
