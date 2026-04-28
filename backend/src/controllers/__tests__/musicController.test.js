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

// Mock do musicService
jest.unstable_mockModule('../../services/musicService.js', () => ({
  generateMusicFromPrompt: jest.fn(),
  getGeneratedMusics: jest.fn(),
}));

// Mock do musicQueue
jest.unstable_mockModule('../../services/musicQueue.js', () => ({
  default: {
    add: jest.fn(),
  },
}));

// Importações dinâmicas após os mocks (necessário para ESM)
const { default: musicController } = await import('../musicController.js');
const { generateMusicFromPrompt, getGeneratedMusics } = await import('../../services/musicService.js');
const { default: musicQueue } = await import('../../services/musicQueue.js');

const app = express();
app.use(express.json());

const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'test-user-id', email: 'test@example.com' };
  next();
};

app.post('/generate-music', mockAuthMiddleware, (req, res) => import('../musicController.js').then(m => m.generateMusic(req, res)));
app.get('/musics', mockAuthMiddleware, (req, res) => import('../musicController.js').then(m => m.getMusics(req, res)));

describe('Music Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateMusic', () => {
    it('should add music to queue and return 202', async () => {
      musicQueue.add.mockResolvedValueOnce({ id: 'job-id' });
      const res = await request(app)
        .post('/generate-music')
        .send({ prompt: 'rock' });

      expect(res.statusCode).toEqual(202);
      expect(res.body.jobId).toEqual('job-id');
      expect(musicQueue.add).toHaveBeenCalledWith({ prompt: 'rock', userId: 'test-user-id' });
    });

    it('should return 500 if adding to queue fails', async () => {
      musicQueue.add.mockRejectedValueOnce(new Error('Queue failed'));
      const res = await request(app)
        .post('/generate-music')
        .send({ prompt: 'jazz' });

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual('Queue failed');
    });
  });

  describe('getMusics', () => {
    it('should return generated musics and 200', async () => {
      getGeneratedMusics.mockResolvedValueOnce([{ id: 'music-id-1', prompt: 'pop', url: 'http://mock.url/1' }]);
      const res = await request(app)
        .get('/musics');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].prompt).toEqual('pop');
      expect(getGeneratedMusics).toHaveBeenCalledWith('test-user-id');
    });
  });
});
