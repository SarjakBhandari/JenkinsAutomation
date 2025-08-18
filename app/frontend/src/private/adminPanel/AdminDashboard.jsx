import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

const AdminPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const token = localStorage.getItem('token'); // Get the token from localStorage

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios.get(`${API_BASE_URL}/organization`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const data = Array.isArray(response.data) ? response.data.map(org => ({
        name: org.name,
        email: org.email
      })) : [];
      setOrganizations(data);
    })
    .catch(error => {
      console.error("Error fetching data: ", error);
    });
  }, [token]);

  const deleteOrganization = (email) => {
    axios.delete(`${API_BASE_URL}/organization/email/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      setOrganizations(organizations.filter((org) => org.email !== email));
    })
    .catch(error => {
      console.error("Error deleting organization: ", error);
    });
  };

  const columns = [
    { name: "Organization Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email },
    {
      name: "Actions",
      cell: (row) => (
        <button onClick={() => deleteOrganization(row.email)} className="delete-btn">Delete</button>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
  };

  return (
    <>
      <nav>
        <Link to="/" className="logo">
          <img src="..\src\img\logo.png" alt="Healthify" />
        </Link>
        <Link to="/" style={{ color: "aliceblue", textDecoration: "none" }}>
          <h1>Healthify | Admin</h1>
        </Link>
        <div id="trans">
          <Link to="#" className="logout-btn" onClick={handleLogout}>LogOut</Link>
        </div>
      </nav>
      <div className="admin-container">
        <DataTable columns={columns} data={organizations} pagination />
      </div>
      <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </>
  );
};

export default AdminPanel;
