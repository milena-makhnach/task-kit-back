import express from 'express';

import {
	createTask,
	getAllTask,
	updateTask,
	removeTask,
	getTask,
} from '../controllers/task.js';
import { verifyToken } from '../middleware/verify-token.js';

export const taskRouter = express.Router();

taskRouter.post('/task', verifyToken, createTask);
// taskRouter.get('/column/:column_id/tasks/', getAllTask);
taskRouter.get('/board/:board_id/task/:task_id', verifyToken, getTask);
taskRouter.put('/task/:task_id', verifyToken, updateTask);
taskRouter.delete('/task/:task_id', verifyToken, removeTask);
