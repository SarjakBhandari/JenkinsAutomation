import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { Search, Plus } from 'lucide-react';
import axios from 'axios';
import "./DoctorManagement.css";

const DoctorMgmt = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchId, setSearchId] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  // Function to get the token from local storage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    // Fetch all doctors with the token
    const token = getToken();
    axios.get(`${API_BASE_URL}/doctor`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setDoctors(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the doctors!', error);
      });
  }, []);

  const deleteDoctor = (id) => {
    const token = getToken();
    axios.delete(`${API_BASE_URL}/doctor/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setDoctors(doctors.filter((doc) => doc.id !== id));
      })
      .catch(error => {
        console.error('There was an error deleting the doctor!', error);
      });
  };

  const handleSearch = () => {
    const token = getToken();
    if (searchId.trim() === '') {
      // Fetch all doctors if search input is empty
      axios.get(`${API_BASE_URL}/doctor`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          setDoctors(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the doctors!', error);
        });
    } else {
      // Fetch doctor by ID with the token
      axios.get(`${API_BASE_URL}/doctor/${searchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          setDoctors([response.data]);
        })
        .catch(error => {
          console.error('There was an error fetching the doctor by ID!', error);
        });
    }
  };

  const doctorColumns = [
    { name: "Doctor Name", selector: (row) => row.name, sortable: true },
    { name: "Specialization", selector: (row) => row.specialization },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => deleteDoctor(row.id)}
          className="delete-button"
        >
          Delete
        </button>
      ),
    },
  ];

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
            <h2>Doctor Management</h2>
            <p>Manage and register doctors in the system</p>
          </div>
          <Link to="/doctor-registration" className="toggle-button">
            <Plus className="icon" size={20} /> Register New Doctor
          </Link>
        </div>

        <div className="list-view">
          <div className="search-bar">
            <input 
              type="text"
              placeholder="Search doctors by ID..." 
              className="search-input"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
            <Search className="search-icon" size={20} onClick={handleSearch} />
          </div>
          <div className="table-wrapper">
            <DataTable
              columns={doctorColumns}
              data={doctors}
              pagination
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

export default DoctorMgmt;
