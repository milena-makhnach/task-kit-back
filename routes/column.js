import express from 'express';

import {
	createColumn,
	getAllColumns,
	updateColumn,
	removeColumn,
} from '../controllers/column.js';
import { verifyToken } from '../middleware/verify-token.js';

export const columnRouter = express.Router();

columnRouter.post('/board/:board_id/columns', verifyToken, createColumn);
columnRouter.get('/board/:board_id/columns', verifyToken, getAllColumns);
columnRouter.put(
	'/board/:board_id/columns/:column_id',
	verifyToken,
	updateColumn
);
columnRouter.delete(
	'/board/:board_id/columns/:column_id',
	verifyToken,
	removeColumn
);
