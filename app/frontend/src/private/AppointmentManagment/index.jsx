import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Plus } from 'lucide-react';
import DataTable from "react-data-table-component";
import "./AppointmentManagement.css";

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch appointments from the API
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/appointment/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setAppointments(response.data);
    })
    .catch(error => {
      console.error("There was an error fetching the appointments!", error);
    });
  }, []);

  const deleteAppointment = (id) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:5000/api/appointment/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setAppointments(appointments.filter((app) => app.id !== id));
    })
    .catch(error => {
      console.error("There was an error deleting the appointment!", error);
    });
  };

  const columns = [
    { name: "Doctor", selector: (row) => row.doctorName, sortable: true },
    { name: "Patient", selector: (row) => row.patientNumber, sortable: true },
    {
      name: "Date",
      selector: (row) => new Date(row.date).toLocaleDateString(), // Format date
      sortable: true,
    },
    {
      name: "Time",
      selector: (row) => new Date(`1970-01-01T${row.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Format time
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => deleteAppointment(row.id)}
          className="delete-button"
        >
          Delete
        </button>
      ),
    },
  ];

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment =>
    appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patientNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Link to="/hospital-dashboard">Back</Link>
        </div>
      </nav>

      <div className="container">
        <div className="header">
          <div className="title">
            <h2>Appointment Management</h2>
            <p>Register and manage appointments in the system</p>
          </div>
          <Link to="/appointment-registration" className="toggle-button">
            <Plus className="icon" size={20} /> Register New Appointment
          </Link>
        </div>

        <div className="list-view">
          <div className="search-bar">
            <input 
              type="text"
              placeholder="Search appointments..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            />
          </div>
          <div className="table-wrapper">
            <DataTable
              columns={columns}
              data={filteredAppointments} // Use filtered appointments
              pagination
              highlightOnHover
              pointerOnHover
            />
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </>
  );
};

export default AppointmentManagement;