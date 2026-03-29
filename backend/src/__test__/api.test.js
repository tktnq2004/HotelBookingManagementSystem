import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';

let mongo;

// ================= SETUP DB =================
beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('MINI HOTEL BOOKING API', () => {

  describe('AUTH API', () => {

    it('POST /api/auth/register - thiếu data', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@gmail.com'
      });

      expect(res.statusCode).toBe(400);
    });

    it('POST /api/auth/login - email sai format', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'abc',
        password: '123456'
      });

      expect(res.statusCode).toBe(400);
    });

  });

  describe('ROOM API', () => {

    it('GET /api/rooms - lấy danh sách phòng', async () => {
      const res = await request(app).get('/api/rooms');

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeDefined();
    });

    it('GET /api/rooms/:id - id sai', async () => {
      const res = await request(app).get('/api/rooms/123');

      expect(res.statusCode).toBe(400);
    });

  });

  describe('BOOKING API', () => {

    it('GET /api/bookings - chưa login', async () => {
      const res = await request(app).get('/api/bookings');

      expect(res.statusCode).toBe(401);
    });

  });

  describe('DASHBOARD API', () => {

    it('GET /api/dashboard - chưa auth', async () => {
      const res = await request(app).get('/api/dashboard');

      expect(res.statusCode).toBe(401);
    });

  });

});