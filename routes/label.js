import express from 'express';

import {
	setTaskLabel,
	removeTaskLable,
	createLabel,
	updateLabel,
	deleteLabel,
} from '../controllers/label.js';

export const labelRouter = express.Router();

labelRouter.post('/task/label', setTaskLabel);
labelRouter.delete('/task/:task_id/label/:label_id', removeTaskLable);
labelRouter.post('/label', createLabel);
labelRouter.patch('/label/:id', updateLabel);
labelRouter.delete('/label/:id', deleteLabel);
