import express from 'express';

import {
	createTask,
	getAllTask,
	updateTask,
	removeTask,
	getTask,
} from '../controllers/task.js';

export const taskRouter = express.Router();

taskRouter.post('/task', createTask);
// taskRouter.get('/column/:column_id/tasks/', getAllTask);
taskRouter.get('/board/:board_id/task/:task_id', getTask);
taskRouter.put('/task/:task_id', updateTask);
taskRouter.delete('/task/:task_id', removeTask);
