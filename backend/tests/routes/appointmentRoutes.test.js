const request = require('supertest');
const express = require('express');
const appointmentRoutes = require('../../routes/appointmentRoutes');
const { generateTokens, mockAppointments, mockUsers } = require('../utils/testHelpers');

// Mock Prisma client
jest.mock('../../prismaClient', () => ({
  appointment: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
}));

const prisma = require('../../prismaClient');

const app = express();
app.use(express.json());
app.use('/api/appointments', appointmentRoutes);

describe('Appointment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments', () => {
    const validAppointmentData = {
      doctorId: 'doctor-id',
      patientId: 'patient-id',
      date: '2024-12-01T10:00:00Z',
    };

    it('should create appointment for doctor', async () => {
      const mockAppointment = {
        id: 'appointment-123',
        ...validAppointmentData,
        date: new Date(validAppointmentData.date),
      };

      prisma.appointment.create.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(validAppointmentData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Appointment booked');
      expect(response.body.appointment).toEqual(mockAppointment);
      
      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: {
          doctorId: validAppointmentData.doctorId,
          patientId: validAppointmentData.patientId,
          date: new Date(validAppointmentData.date),
        },
      });
    });

    it('should create appointment for patient', async () => {
      const mockAppointment = {
        id: 'appointment-123',
        ...validAppointmentData,
        date: new Date(validAppointmentData.date),
      };

      prisma.appointment.create.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.patient()}`)
        .send(validAppointmentData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Appointment booked');
      expect(response.body.appointment).toEqual(mockAppointment);
    });

    it('should return 403 for admin users', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.admin()}`)
        .send(validAppointmentData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.appointment.create).not.toHaveBeenCalled();
    });

    it('should return 400 when appointment creation fails', async () => {
      prisma.appointment.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(validAppointmentData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Error booking appointment');
    });

    it('should handle invalid date format', async () => {
      const invalidData = {
        ...validAppointmentData,
        date: 'invalid-date',
      };

      prisma.appointment.create.mockRejectedValue(new Error('Invalid date'));

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Error booking appointment');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        doctorId: 'doctor-id',
        // Missing patientId and date
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/appointments', () => {
    it('should return all appointments for admin', async () => {
      const mockAppointmentsList = [
        mockAppointments.appointment1,
        mockAppointments.appointment2,
      ];

      prisma.appointment.findMany.mockResolvedValue(mockAppointmentsList);

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.admin()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAppointmentsList);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        include: { doctor: true, patient: true },
      });
    });

    it('should return all appointments for doctor', async () => {
      const mockAppointmentsList = [mockAppointments.appointment1];

      prisma.appointment.findMany.mockResolvedValue(mockAppointmentsList);

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAppointmentsList);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        include: { doctor: true, patient: true },
      });
    });

    it('should return 403 for patient users', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.appointment.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      prisma.appointment.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.admin()}`);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/appointments/my', () => {
    it('should return patient\'s appointments', async () => {
      const patientAppointments = [
        {
          ...mockAppointments.appointment1,
          doctor: mockUsers.doctor,
        },
      ];

      prisma.appointment.findMany.mockResolvedValue(patientAppointments);

      const response = await request(app)
        .get('/api/appointments/my')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(patientAppointments);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-id' },
        include: { doctor: true },
      });
    });

    it('should return empty array when patient has no appointments', async () => {
      prisma.appointment.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/appointments/my')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 403 for non-patient users', async () => {
      const response = await request(app)
        .get('/api/appointments/my')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.appointment.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      prisma.appointment.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/appointments/my')
        .set('Authorization', `Bearer ${generateTokens.patient()}`);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/appointments/:id/status', () => {
    const appointmentId = 'appointment-123';
    const statusUpdateData = { status: 'confirmed' };

    it('should update appointment status for doctor', async () => {
      const updatedAppointment = {
        ...mockAppointments.appointment1,
        status: 'confirmed',
      };

      prisma.appointment.update.mockResolvedValue(updatedAppointment);

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(statusUpdateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Appointment status updated');
      expect(response.body.appointment).toEqual(updatedAppointment);
      
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: appointmentId },
        data: { status: 'confirmed' },
      });
    });

    it('should return 403 for non-doctor users', async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${generateTokens.patient()}`)
        .send(statusUpdateData);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
      expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    it('should return 400 when update fails', async () => {
      prisma.appointment.update.mockRejectedValue(new Error('Appointment not found'));

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(statusUpdateData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Failed to update appointment');
    });

    it('should handle missing status in request body', async () => {
      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle various status values', async () => {
      const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      
      for (const status of statuses) {
        const updatedAppointment = {
          ...mockAppointments.appointment1,
          status,
        };

        prisma.appointment.update.mockResolvedValue(updatedAppointment);

        const response = await request(app)
          .put(`/api/appointments/${appointmentId}/status`)
          .set('Authorization', `Bearer ${generateTokens.doctor()}`)
          .send({ status });

        expect(response.status).toBe(200);
        expect(response.body.appointment.status).toBe(status);
      }
    });
  });

  describe('Authorization edge cases', () => {
    it('should handle missing authorization token', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({
          doctorId: 'doctor-id',
          patientId: 'patient-id',
          date: '2024-12-01T10:00:00Z',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should handle invalid authorization token', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Date handling', () => {
    it('should properly convert date strings to Date objects', async () => {
      const appointmentData = {
        doctorId: 'doctor-id',
        patientId: 'patient-id',
        date: '2024-12-01T10:00:00Z',
      };

      const mockAppointment = {
        id: 'appointment-123',
        ...appointmentData,
        date: new Date(appointmentData.date),
      };

      prisma.appointment.create.mockResolvedValue(mockAppointment);

      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${generateTokens.doctor()}`)
        .send(appointmentData);

      const createCall = prisma.appointment.create.mock.calls[0][0];
      expect(createCall.data.date).toBeInstanceOf(Date);
      expect(createCall.data.date.toISOString()).toBe(appointmentData.date);
    });
  });
});