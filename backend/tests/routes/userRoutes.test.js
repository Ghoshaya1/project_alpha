const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/userRoutes');
const { generateTokens, mockUsers, mockPatients } = require('../utils/testHelpers');

// Mock Prisma client
jest.mock('../../prismaClient', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  patient: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

const prisma = require('../../prismaClient');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const mockUsersList = [mockUsers.admin, mockUsers.doctor, mockUsers.patient];
      prisma.user.findMany.mockResolvedValue(mockUsersList);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${generateTokens.admin()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsersList);
      expect(prisma.user.findMany).toHaveBeenCalledWith();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should return 403 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      prisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${generateTokens.admin()}`);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/users/me', () => {
    it('should return current user info for authenticated user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUsers.doctor);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers.doctor);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'doctor-id' }
      });
    });

    it('should work for any authenticated user role', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUsers.patient);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers.patient);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-id' }
      });
    });

    it('should return 403 when no token is provided', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should handle case when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('GET /api/users/my-patients', () => {
    it('should return patients for authenticated doctor', async () => {
      const doctorPatients = [mockPatients.patient1, mockPatients.patient2];
      prisma.patient.findMany.mockResolvedValue(doctorPatients);

      const response = await request(app)
        .get('/api/users/my-patients')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(doctorPatients);
      expect(prisma.patient.findMany).toHaveBeenCalledWith({
        where: { doctorId: 'doctor-id' }
      });
    });

    it('should return 403 for non-doctor users', async () => {
      const response = await request(app)
        .get('/api/users/my-patients')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.patient.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array when doctor has no patients', async () => {
      prisma.patient.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users/my-patients')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors', async () => {
      prisma.patient.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users/my-patients')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch patients');
    });
  });

  describe('GET /api/users/patient/:id', () => {
    const patientId = 'patient-1';

    it('should return patient details for doctor', async () => {
      prisma.patient.findUnique.mockResolvedValue(mockPatients.patient1);

      const response = await request(app)
        .get(`/api/users/patient/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPatients.patient1);
      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: patientId }
      });
    });

    it('should return patient details for the patient themselves', async () => {
      const patientToken = generateTokens.patient();
      const patientData = { ...mockPatients.patient1, id: 'patient-id' };
      prisma.patient.findUnique.mockResolvedValue(patientData);

      const response = await request(app)
        .get('/api/users/patient/patient-id')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(patientData);
    });

    it('should return 403 when patient tries to access another patient\'s data', async () => {
      const otherPatientData = { ...mockPatients.patient1, id: 'other-patient-id' };
      prisma.patient.findUnique.mockResolvedValue(otherPatientData);

      const response = await request(app)
        .get('/api/users/patient/other-patient-id')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should return 404 when patient is not found', async () => {
      prisma.patient.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/users/patient/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Patient not found');
    });

    it('should return 403 for admin users (not authorized for this endpoint)', async () => {
      const response = await request(app)
        .get(`/api/users/patient/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.admin()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('should handle database errors', async () => {
      prisma.patient.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/users/patient/${patientId}`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch patient details');
    });
  });

  describe('Authorization edge cases', () => {
    it('should handle invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });
  });
});