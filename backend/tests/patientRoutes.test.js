const request = require('supertest');
const express = require('express');
const patientRoutes = require('../routes/patientRoutes');
const { generateTokens, mockPatients } = require('./utils/testHelpers');

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
  });

  describe('POST /api/patients', () => {
    const validPatientData = {
      name: 'John Doe',
      age: 30,
      medicalHistory: 'No significant history',
      insuranceDetails: 'Health Plus',
    };

    it('should create a patient with correct doctorId from token', async () => {
      const mockPatient = {
        id: 'patient-123',
        ...validPatientData,
        doctorId: 'doctor-id',
      };

      prisma.patient.create.mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(validPatientData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('patient created');
      expect(response.body.patient).toEqual(mockPatient);
      
      // Verify that prisma.patient.create was called with correct doctorId
      expect(prisma.patient.create).toHaveBeenCalledWith({
        data: {
          ...validPatientData,
          doctorId: 'doctor-id', // This should match userId from token
        },
      });
    });

    it('should return 403 for non-doctor users', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${generateTokens.patient()}`)
        .send(validPatientData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.patient.create).not.toHaveBeenCalled();
    });

    it('should return 403 when no token is provided', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send(validPatientData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
      expect(prisma.patient.create).not.toHaveBeenCalled();
    });

    it('should return 400 when patient creation fails', async () => {
      prisma.patient.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(validPatientData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Error creating patient');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        // Missing age
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/patients/:id', () => {
    const patientId = 'patient-1';

    it('should return patient details for doctor', async () => {
      prisma.patient.findUnique.mockResolvedValue(mockPatients.patient1);

      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPatients.patient1);
      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: patientId },
      });
    });

    it('should return patient details for the patient themselves', async () => {
      const patientData = { ...mockPatients.patient1, id: 'patient-id' };
      prisma.patient.findUnique.mockResolvedValue(patientData);

      const response = await request(app)
        .get('/api/patients/patient-id')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(patientData);
    });

    it('should return 403 when patient tries to access another patient\'s data', async () => {
      const otherPatientData = { ...mockPatients.patient1, id: 'other-patient-id' };
      prisma.patient.findUnique.mockResolvedValue(otherPatientData);

      const response = await request(app)
        .get('/api/patients/other-patient-id')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 404 when patient is not found', async () => {
      prisma.patient.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Patient not found');
    });

    it('should handle database errors', async () => {
      prisma.patient.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch patient details');
    });
  });

  describe('DELETE /api/patients/:id', () => {
    const patientId = 'patient-1';

    it('should delete patient for doctor', async () => {
      const deletedPatient = mockPatients.patient1;
      prisma.patient.delete.mockResolvedValue(deletedPatient);

      const response = await request(app)
        .delete(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Patient deleted');
      expect(response.body.patient).toEqual(deletedPatient);
      expect(prisma.patient.delete).toHaveBeenCalledWith({
        where: { id: patientId },
      });
    });

    it('should return 403 for non-doctor users', async () => {
      const response = await request(app)
        .delete(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.patient.delete).not.toHaveBeenCalled();
    });

    it('should return 500 when deletion fails', async () => {
      prisma.patient.delete.mockRejectedValue(new Error('Patient not found'));

      const response = await request(app)
        .delete(`/api/patients/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete patient');
    });
  });
});