import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import './HospitalRegistration.css';

const HospitalRegistration = () => {
  const navigate = useNavigate(); 
 const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const schema = yup.object().shape({
    organization: yup.string().required('Organization name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    address: yup.string().required('Address is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
  });


  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });


  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register/organization`,
        {
          name: data.organization, 
          email: data.email,
          address: data.address,
          password: data.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Registration Successful:', response.data);
      alert('Registration Successful!');

      reset();
      navigate('/login'); 

    } catch (error) {
      console.error('Error registering organization:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Registration failed! Please try again.');
    }
  };

  return (
    <Fragment>
      <nav>
        <Link to="/" className="logo">
          <img src="./src/img/logo.png" alt="Healthify" />
        </Link>
        <Link to="/" style={{ color: 'aliceblue', textDecoration: 'none' }}>
          <h1>Healthify | Registration</h1>
        </Link>
        <div id="trans">
          <Link to="/login">Login</Link>
          <Link to="/about">About</Link>
        </div>
      </nav>
      <div id="subnav">
        <Link to="/login">Login</Link>
        <Link to="/about">About</Link>
      </div>
      <main>
        <div id="register">
          <div id="reg">
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="organization">Organization Name</label>
              <input
                type="text"
                id="organization"
                {...register('organization')}
              />
              {errors.organization && <p className="error">{errors.organization.message}</p>}

              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                {...register('email')}
              />
              {errors.email && <p className="error">{errors.email.message}</p>}

              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                {...register('address')}
              />
              {errors.address && <p className="error">{errors.address.message}</p>}

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                {...register('password')}
              />
              {errors.password && <p className="error">{errors.password.message}</p>}

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

              <button type="submit" className="button">Register</button>
            </form>
          </div>
          <div id="inside">
            <h1>Register</h1>
            <img src="./src/img/regImg.png" alt="Hospital Pic" /><br />
            <Link to="/login" style={{ fontSize: '1rem' }}>Already Registered? Sign In</Link>
          </div>
        </div>
      </main>
      <footer>
        <p>&copy; 2024 Web Development Project. By Sarjak Bhandari.</p>
      </footer>
    </Fragment>
  );
};

export default HospitalRegistration;
