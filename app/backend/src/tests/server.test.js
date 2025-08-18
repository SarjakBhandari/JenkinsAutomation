const axios = require("axios");
const { describe, it, expect } = require("@jest/globals");

let authToken = ""; // Store the authentication token for subsequent tests
let appointmentId = "";
let patientId = "";
let doctorId = "";
let staffId = "";

const BASE_URL = "http://localhost:5000/api"; // Change if your server runs on a different port

// Helper function for error logging
const setServerError = (message) => {
  console.error(message);
};

// ✅ **1. admin Login**
describe("admin Login", () => {
  it("should login and return a token", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: "admin@admin.com",
        password: "admin@admin",
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");

      authToken = response.data.token; // Save token for future tests
    } catch (error) {
      setServerError(error.response?.data?.message || "Login failed.");
    }
  });
});


// ✅ **3. Appointment CRUD**
describe("Appointment CRUD", () => {
  it("should create an appointment", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/appointment`,
        {
          patientId: 1,
          doctorId: 1,
          date: "2025-03-01",
          time: "10:00 AM",
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(201);
      appointmentId = response.data.id;
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to create appointment.");
    }
  });

  it("should fetch all appointments", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/appointment/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBeTruthy();
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to fetch appointments.");
    }
  });
});

// ✅ **4. Patient CRUD**
describe("Patient CRUD", () => {
  it("should add a patient", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/patient`,
        {
          name: "John Doe",
          phone: "1234567890",
          disease: "Flu",
          address: "123 Main Street",
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(201);
      patientId = response.data.id;
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to add patient.");
    }
  });
});

// ✅ **5. Doctor CRUD**
describe("Doctor CRUD", () => {
  it("should add a doctor", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/doctor`,
        {
          name: "Dr. Smith",
          specialization: "Cardiology",
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(201);
      doctorId = response.data.id;
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to add doctor.");
    }
  });
});

// ✅ **6. Staff CRUD**
describe("Staff CRUD", () => {
  it("should add a staff member", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/staff`,
        {
          name: "Alice Johnson",
          phone: "9876543210",
          branch: "Emergency",
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(201);
      staffId = response.data.id;
    } catch (error) {
      setServerError(error.response?.data?.message || "Failed to add staff member.");
    }
  });
});
