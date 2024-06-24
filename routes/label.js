import express from 'express';

import {
	setTaskLabel,
	removeTaskLable,
	createLabel,
	updateLabel,
	deleteLabel,
} from '../controllers/label.js';
import { verifyToken } from '../middleware/verify-token.js';

export const labelRouter = express.Router();

labelRouter.post('/task/label', verifyToken, setTaskLabel);
labelRouter.delete(
	'/task/:task_id/label/:label_id',
	verifyToken,
	removeTaskLable
);
labelRouter.post('/label', verifyToken, createLabel);
labelRouter.patch('/label/:id', verifyToken, updateLabel);
labelRouter.delete('/label/:id', verifyToken, deleteLabel);
