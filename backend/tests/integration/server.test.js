const request = require('supertest');
const express = require('express');

// Mock all route modules before importing server
jest.mock('../../routes/authRoutes', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ message: 'auth routes working' }));
  return router;
});

jest.mock('../../routes/userRoutes', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ message: 'user routes working' }));
  return router;
});

jest.mock('../../routes/patientRoutes', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ message: 'patient routes working' }));
  return router;
});

jest.mock('../../routes/appointmentRoutes', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.json({ message: 'appointment routes working' }));
  return router;
});

// Mock swagger
jest.mock('yamljs', () => ({
  load: jest.fn().mockReturnValue({}),
}));

jest.mock('swagger-ui-express', () => ({
  serve: (req, res, next) => next(),
  setup: () => (req, res) => res.json({ message: 'swagger ui' }),
}));

describe('Server Integration', () => {
  let app;

  beforeEach(() => {
    // Clear module cache to get fresh server instance
    jest.resetModules();
    
    // Mock environment variables
    process.env.PORT = '3000';
    process.env.JWT_SECRET = 'test-secret';
    
    // Import server after mocking
    const serverModule = require('../../server');
    app = serverModule;
  });

  describe('Basic server functionality', () => {
    it('should respond to root endpoint', async () => {
      const response = await request(app)
        .get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Patient Management System API is running...');
    });

    it('should have CORS enabled', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should parse JSON bodies', async () => {
      const response = await request(app)
        .post('/api/auth/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Should not return 400 for JSON parsing issues
      expect(response.status).not.toBe(400);
    });
  });

  describe('Route mounting', () => {
    it('should mount auth routes', async () => {
      const response = await request(app)
        .get('/api/auth/test');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('auth routes working');
    });

    it('should mount user routes', async () => {
      const response = await request(app)
        .get('/api/users/test');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('user routes working');
    });

    it('should mount patient routes', async () => {
      const response = await request(app)
        .get('/api/patients/test');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('patient routes working');
    });

    it('should mount appointment routes', async () => {
      const response = await request(app)
        .get('/api/appointments/test');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('appointment routes working');
    });

    it('should mount swagger documentation', async () => {
      const response = await request(app)
        .get('/api-docs');

      expect(response.status).toBe(200);
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route');

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/test')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });
});