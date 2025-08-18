import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import logo from '../../img/logo.png';  
import doctorImg from '../../img/doctor.jpg';
import { API_BASE_URL } from "../../config";


const Login = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');


  const schema = yup.object().shape({
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
      
      // Extract token and userType from API response
      const { token, userType } = response.data;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userType", userType);

      // Redirect based on user type
      if (userType === "admin") {
        navigate("/admin");
      } else if (userType === "organization") {
        navigate("/hospital-dashboard");
      } else {
        setServerError("Invalid user role.");
      }

    } catch (error) {
      setServerError(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <>
      <nav>
        <Link to="/" className="logo">
          <img src={logo} alt="Healthify" />
        </Link>
        <Link to="/" style={{ color: "aliceblue", textDecoration: "none" }}>
          <h1>Healthify | Login </h1>
        </Link>
        <div id="trans">
          <Link to="/register">Register</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>

      <div id="subnav">
        <Link to="/register">Register</Link>
        <Link to="/about">About</Link>
      </div>

      <main>
        <div id="login">
          <form id="entry" onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="email">Email</label>
            <input placeholder="Email" {...register('email')} />
            {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

            <label htmlFor="password">Password</label>
            <input placeholder="Password" type="password" {...register('password')} />
            {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}

            {serverError && <p style={{ color: "red" }}>{serverError}</p>}

            <div id="submitt" style={{ display: 'flex', alignItems: 'center' }}>
              <input className="button" type="submit" value="Sign In" />
              <p style={{ fontSize: '0.8rem' }}>
                New to Healthify? <Link to="/register" style={{ fontSize: '0.8rem' }}>Sign Up</Link>
              </p>
            </div>
          </form>
          <img src={doctorImg} alt="Doctor" />
        </div>
      </main>

      <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </>
  );
};

export default Login;
