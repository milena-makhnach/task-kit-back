import express from 'express';

import { getPhotos, postPhoto } from '../controllers/photo.js';

export const photoRouter = express.Router();

photoRouter.post('/photo', postPhoto);
photoRouter.get('/photo', getPhotos);
