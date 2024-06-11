import express from 'express';

import { createUserTask, removeUserTask } from '../controllers/task_user.js';

export const taskUserRouter = express.Router();

taskUserRouter.post('/task_user', createUserTask);
taskUserRouter.delete('/task_user/:user_id/:task_id', removeUserTask);
