import express from 'express';

import { getPhotos, postPhoto } from '../controllers/photo.js';
import { verifyToken } from '../middleware/verify-token.js';

export const photoRouter = express.Router();

photoRouter.post('/photo', verifyToken, postPhoto);
photoRouter.get('/photo', verifyToken, getPhotos);
