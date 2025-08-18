import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Search, Plus, Edit2, Trash2, 
  Phone, Mail, Calendar, ChevronLeft, MapPin 
} from 'lucide-react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import './PatientManagement.css';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [searchPhone, setSearchPhone] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // Function to get the token from local storage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    // Fetch all patients with the token
    const token = getToken();
    axios.get(`${API_BASE_URL}/patient`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the patients!', error);
      });
  }, []);

  const deletePatient = (phone) => {
    const token = getToken();
    axios.delete(`${API_BASE_URL}patient/phone/${phone}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setPatients(patients.filter(patient => patient.phone !== phone));
      })
      .catch(error => {
        console.error('There was an error deleting the patient!', error);
      });
  };

  const handleSearch = () => {
    const token = getToken();
    if (searchPhone.trim() === '') {
      // Fetch all patients if search input is empty
      axios.get(`${API_BASE_URL}/patient`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          setPatients(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the patients!', error);
        });
    } else {
      // Fetch patient by phone number with the token
      axios.get(`${API_BASE_URL}/patient/phone/${searchPhone}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          setPatients([response.data]);
        })
        .catch(error => {
          console.error('There was an error fetching the patient by phone number!', error);
        });
    }
  };

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Contact',
      cell: row => (
        <div className="contact-info">
          <div className="phone-info">
            <Phone className="info-icon" size={16} />
            {row.phone}
          </div>
        </div>
      ),
    },
    {
      name: 'Disease',
      selector: row => row.disease,
      sortable: true,
    },
    {
      name: 'Address',
      cell: row => (
        <div className="address">
          <MapPin className="address-icon" size={16} />
          {row.address}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => deletePatient(row.phone)}
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
            <h2>Patient Management</h2>
            <p>Manage and register patients in the system</p>
          </div>
          <Link to="/patient-registration" className="toggle-button">
            <Plus className="icon" size={20} /> Register New Patient
          </Link>
        </div>

        <div className="list-view">
          <div className="search-bar">
            <input 
              type="text"
              placeholder="Search patients by phone number..." 
              className="search-input"
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
            />
            <Search className="search-icon" size={20} onClick={handleSearch} />
          </div>
          <div className="table-wrapper">
            <DataTable
              columns={columns}
              data={patients}
              pagination
            />
          </div>
        </div>
      </div>
      <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </>
  );
};

export default PatientManagement;
