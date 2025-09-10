const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/authMiddleware');
const { mockRequest, mockResponse, mockNext, generateToken } = require('../utils/testHelpers');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext();
  });

  describe('Token validation', () => {
    it('should return 403 when no authorization header is provided', () => {
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when authorization header is malformed', () => {
      req.headers.authorization = 'InvalidToken';
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      req.headers.authorization = 'Bearer invalid-token';
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      const expiredToken = jwt.sign(
        { userId: 'test-id', role: 'doctor' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired token
      );
      req.headers.authorization = `Bearer ${expiredToken}`;
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() when token is valid', () => {
      const token = generateToken({ userId: 'test-id', role: 'doctor' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(req.user).toEqual({
        userId: 'test-id',
        role: 'doctor',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Role-based authorization', () => {
    it('should allow access when no roles are specified', () => {
      const token = generateToken({ userId: 'test-id', role: 'patient' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when user role matches required role', () => {
      const token = generateToken({ userId: 'test-id', role: 'doctor' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware(['doctor']);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access when user role is in required roles array', () => {
      const token = generateToken({ userId: 'test-id', role: 'admin' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware(['admin', 'doctor']);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 when user role does not match required role', () => {
      const token = generateToken({ userId: 'test-id', role: 'patient' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware(['doctor']);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 when user role is not in required roles array', () => {
      const token = generateToken({ userId: 'test-id', role: 'patient' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware(['admin', 'doctor']);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty roles array', () => {
      const token = generateToken({ userId: 'test-id', role: 'patient' });
      req.headers.authorization = `Bearer ${token}`;
      const middleware = authMiddleware([]);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle token without role', () => {
      const tokenWithoutRole = jwt.sign(
        { userId: 'test-id' }, // No role
        process.env.JWT_SECRET
      );
      req.headers.authorization = `Bearer ${tokenWithoutRole}`;
      const middleware = authMiddleware(['doctor']);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle authorization header with extra spaces', () => {
      const token = generateToken({ userId: 'test-id', role: 'doctor' });
      req.headers.authorization = `  Bearer   ${token}  `;
      const middleware = authMiddleware();
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});