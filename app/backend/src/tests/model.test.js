const { describe, it, expect } = require('@jest/globals');
const SequelizeMock = require('sequelize-mock');  // Import sequelize-mock

// Mock Sequelize connection
const dbMock = new SequelizeMock();

// Import models with mock behavior
const Admin = require('../models/Admin');  
const Appointment = require('../models/Appointment');  
const Doctor = require('../models/Doctor');  
const Organization = require('../models/Organization');  
const Patient = require('../models/Patient');  
const Staff = require('../models/Staff');  


const adminMock = dbMock.define('Admin', {
  email: 'admin@admin.com',
  password: 'admin@admin',
});

const appointmentMock = dbMock.define('Appointment', {
  patientNumber: '1234567890',
  doctorName: 'Dr. Smith',
  date: '2025-03-01',
  time: '10:00 AM',
});

const doctorMock = dbMock.define('Doctor', {
  name: 'Dr. John Doe',
  specialization: 'Neurology',
});

const organizationMock = dbMock.define('Organization', {
  name: 'Healthify Org',
  email: 'org@healthify.com',
  address: '123 Medical Street',
  password: 'testpassword',
});

const patientMock = dbMock.define('Patient', {
  name: 'John Doe',
  phone: '1234567890',
  disease: 'Flu',
  address: '123 Main Street',
});

const staffMock = dbMock.define('Staff', {
  name: 'Alice Johnson',
  phone: '9876543210',
  branch: 'Emergency',
});

describe("Admin Model", () => {
  it("should create an admin", async () => {
    const admin = await adminMock.create({
      email: "admin@admin.com",
      password: "admin@admin",
    });

    expect(admin).toHaveProperty("email");
    expect(admin.email).toBe("admin@admin.com");
  });

  it("should find an admin by email", async () => {
    const admin = await adminMock.findOne({ where: { email: "admin@admin.com" } });

    expect(admin).not.toBeNull();
    expect(admin.email).toBe("admin@admin.com");
  });
});


describe("Appointment Model", () => {
  it("should create an appointment", async () => {
    const appointment = await appointmentMock.create({
      patientNumber: "1234567890",
      doctorName: "Dr. Smith",
      date: "2025-03-01",
      time: "10:00 AM",
    });

    expect(appointment).toHaveProperty("patientNumber");
    expect(appointment.patientNumber).toBe("1234567890");
  });

  it("should fetch appointment by doctor name", async () => {
    const appointment = await appointmentMock.findOne({
      where: { doctorName: "Dr. Smith" },
    });

    expect(appointment).not.toBeNull();
    expect(appointment.doctorName).toBe("Dr. Smith");
  });
});

describe("Doctor Model", () => {
  it("should create a doctor", async () => {
    const doctor = await doctorMock.create({
      name: "Dr. John Doe",
      specialization: "Neurology",
    });

    expect(doctor).toHaveProperty("name");
    expect(doctor.name).toBe("Dr. John Doe");
  });

  it("should find a doctor by specialization", async () => {
    const doctor = await doctorMock.findOne({
      where: { specialization: "Neurology" },
    });

    expect(doctor).not.toBeNull();
    expect(doctor.specialization).toBe("Neurology");
  });
});


describe("Organization Model", () => {
  it("should create an organization", async () => {
    const organization = await organizationMock.create({
      name: "Healthify Org",
      email: "org@healthify.com",
      address: "123 Medical Street",
      password: "testpassword",
    });

    expect(organization).toHaveProperty("name");
    expect(organization.name).toBe("Healthify Org");
  });

  it("should find an organization by email", async () => {
    const organization = await organizationMock.findOne({
      where: { email: "org@healthify.com" },
    });

    expect(organization).not.toBeNull();
    expect(organization.email).toBe("org@healthify.com");
  });
});


describe("Patient Model", () => {
  it("should create a patient", async () => {
    const patient = await patientMock.create({
      name: "John Doe",
      phone: "1234567890",
      disease: "Flu",
      address: "123 Main Street",
    });

    expect(patient).toHaveProperty("name");
    expect(patient.name).toBe("John Doe");
  });

  it("should find a patient by phone", async () => {
    const patient = await patientMock.findOne({ where: { phone: "1234567890" } });

    expect(patient).not.toBeNull();
    expect(patient.disease).toBe("Flu");
  });
});


describe("Staff Model", () => {
  it("should create a staff member", async () => {
    const staff = await staffMock.create({
      name: "Alice Johnson",
      phone: "9876543210",
      branch: "Emergency",
    });

    expect(staff).toHaveProperty("name");
    expect(staff.name).toBe("Alice Johnson");
  });

  it("should find a staff member by phone", async () => {
    const staff = await staffMock.findOne({ where: { phone: "9876543210" } });

    expect(staff).not.toBeNull();
    expect(staff.branch).toBe("Emergency");
  });
});
