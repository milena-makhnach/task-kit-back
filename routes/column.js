import express from 'express';

import {
	createColumn,
	getAllColumns,
	updateColumn,
	removeColumn,
} from '../controllers/column.js';

export const columnRouter = express.Router();

columnRouter.post('/board/:board_id/columns', createColumn);
columnRouter.get('/board/:board_id/columns', getAllColumns);
columnRouter.put('/board/:board_id/columns/:column_id', updateColumn);
columnRouter.delete('/board/:board_id/columns/:column_id', removeColumn);
