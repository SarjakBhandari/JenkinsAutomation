import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import axios from 'axios';
import DataTable from "react-data-table-component";
import './StaffManagement.css';
import { API_BASE_URL } from "../../config";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
 

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to fetch staff members:", error);
    }
  };

  const deleteStaff = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/staff/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStaff(staff.filter((member) => member.id !== id));
    } catch (error) {
      console.error("Failed to delete staff member:", error);
    }
  };

  const searchStaff = async (phone) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/staff/${phone}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to search staff:", error);
    }
  };

  const handleSearchChange = (event) => {
    const phone = event.target.value;
    setSearchQuery(phone);
    if (phone.length > 0) {
      searchStaff(phone);
    } else {
      fetchStaff();
    }
  };

  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Phone Number", selector: (row) => row.phone, sortable: true },
    { name: "Branch", selector: (row) => row.branch, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => deleteStaff(row.id)}
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
            <h2>Staff Management</h2>
            <p>Manage and register staff in the system</p>
          </div>
          <Link to="/staff-registration" className="toggle-button">
            <Plus className="icon" size={20} /> Register New Staff
          </Link>
        </div>

        <div className="list-view">
          <div className="search-bar">
            <input 
              type="text"
              placeholder="Search staff by phone number..." 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="table-wrapper">
            <DataTable
              columns={columns}
              data={staff}
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

export default StaffManagement;
