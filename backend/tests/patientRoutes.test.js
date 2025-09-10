const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const patientRoutes = require('../routes/patientRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

// Mock Prisma client
jest.mock('../prismaClient', () => ({
  patient: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../prismaClient');

const app = express();
app.use(express.json());
app.use('/api/patients', patientRoutes);

describe('Patient Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/patients', () => {
    it('should create a patient with correct doctorId from token', async () => {
      const mockPatient = {
        id: 'patient-123',
        name: 'John Doe',
        age: 30,
        medicalHistory: 'None',
        insuranceDetails: 'Health Plus',
        doctorId: 'doctor-456',
      };

      const token = jwt.sign(
        { userId: 'doctor-456', role: 'doctor' },
        process.env.JWT_SECRET
      );

      prisma.patient.create.mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          age: 30,
          medicalHistory: 'None',
          insuranceDetails: 'Health Plus',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('patient created');
      expect(response.body.patient).toEqual(mockPatient);
      
      // Verify that prisma.patient.create was called with correct doctorId
      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          age: 30,
          medicalHistory: 'None',
          insuranceDetails: 'Health Plus',
          doctorId: 'doctor-456', // This should match userId from token
        },
      });
    });

    it('should return 403 for non-doctor users', async () => {
      const token = jwt.sign(
        { userId: 'patient-123', role: 'patient' },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          age: 30,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('should return 403 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send({
          name: 'John Doe',
          age: 30,
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });
  });
});