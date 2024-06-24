import express from 'express';

import { createUserTask, removeUserTask } from '../controllers/task_user.js';
import { verifyToken } from '../middleware/verify-token.js';

export const taskUserRouter = express.Router();

taskUserRouter.post('/task_user', verifyToken, createUserTask);
taskUserRouter.delete(
	'/task_user/:user_id/:task_id',
	verifyToken,
	removeUserTask
);
