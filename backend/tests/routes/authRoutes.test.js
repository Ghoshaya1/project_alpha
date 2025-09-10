const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRoutes = require('../../routes/authRoutes');
const { mockUsers } = require('../utils/testHelpers');

// Mock Prisma client
jest.mock('../../prismaClient', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

const prisma = require('../../prismaClient');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      name: 'John Doe',
      email: 'john@test.com',
      password: 'password123',
      role: 'doctor',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        ...validRegistrationData,
        password: 'hashedpassword',
      };

      prisma.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered');
      expect(response.body.user).toEqual(mockUser);
      
      // Verify password was hashed
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: validRegistrationData.name,
          email: validRegistrationData.email,
          password: expect.any(String), // Should be hashed
          role: validRegistrationData.role,
        },
      });
      
      // Verify the password was actually hashed
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(validRegistrationData.password);
    });

    it('should return 400 when user already exists', async () => {
      prisma.user.create.mockRejectedValue(new Error('Unique constraint failed'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john@test.com',
        // Missing password and role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      expect(response.status).toBe(400);
    });

    it('should handle invalid email format', async () => {
      const invalidEmailData = {
        ...validRegistrationData,
        email: 'invalid-email',
      };

      prisma.user.create.mockRejectedValue(new Error('Invalid email'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'doctor@test.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(validLoginData.password, 10);
      const mockUser = {
        ...mockUsers.doctor,
        password: hashedPassword,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      
      // Verify token contains correct data
      const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decodedToken.userId).toBe(mockUser.id);
      expect(decodedToken.role).toBe(mockUser.role);
    });

    it('should return 400 when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 401 when password is invalid', async () => {
      const hashedPassword = await bcrypt.hash('differentpassword', 10);
      const mockUser = {
        ...mockUsers.doctor,
        password: hashedPassword,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid password');
    });

    it('should return 500 when database error occurs', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User not found');
    });

    it('should handle missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User not found');
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User not found');
    });
  });

  describe('Password hashing', () => {
    it('should hash password with bcrypt during registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'plainpassword',
        role: 'patient',
      };

      const mockUser = { id: 'user-123', ...userData };
      prisma.user.create.mockResolvedValue(mockUser);

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const createCall = prisma.user.create.mock.calls[0][0];
      const hashedPassword = createCall.data.password;
      
      // Verify password was hashed
      expect(hashedPassword).not.toBe(userData.password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
      
      // Verify the hash can be compared with original password
      const isValid = await bcrypt.compare(userData.password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('JWT token generation', () => {
    it('should generate valid JWT token with correct payload', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@test.com',
        role: 'doctor',
        password: hashedPassword,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' });

      const token = response.body.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000); // Should not be expired
      expect(decoded.iat).toBeLessThanOrEqual(Date.now() / 1000); // Should be issued now or before
    });
  });
});