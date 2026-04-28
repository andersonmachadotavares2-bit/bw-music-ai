import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Mock do logger
jest.unstable_mockModule('../../config/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do supabaseAdmin
const mockSupabaseAdmin = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({ data: {}, error: null })),
      })),
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn(() => ({ data: {}, error: null })),
      })),
    })),
  })),
};

jest.unstable_mockModule('../../config/supabase.js', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

// Importações dinâmicas
const authController = await import('../authController.js');

const app = express();
app.use(express.json());

app.post('/auth/signup', authController.signUp);
app.post('/auth/login', authController.signIn);
app.post('/auth/recover-password', authController.recoverPassword);
app.get('/auth/me', (req, res, next) => { req.user = { id: 'test-user-id', email: 'test@example.com' }; next(); }, authController.getMe);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should register a new user and return 201', async () => {
      mockSupabaseAdmin.auth.signUp.mockResolvedValueOnce({ data: { user: { id: 'user-id', email: 'test@example.com' } }, error: null });
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'password123', fullName: 'Test User' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.user.email).toEqual('test@example.com');
    });

    it('should return 400 if email or password are missing', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('signIn', () => {
    it('should login a user and return 200', async () => {
      mockSupabaseAdmin.auth.signInWithPassword.mockResolvedValueOnce({ data: { session: { access_token: 'token' }, user: { id: 'user-id' } }, error: null });
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.session.access_token).toEqual('token');
    });
  });
});
