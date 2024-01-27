import express from 'express';

import {
	createBoard,
	getBoards,
	getBoard,
	removeBoard,
	updateBoard,
} from '../controllers/board.js';

export const boardRouter = express.Router();

boardRouter.post('/board', createBoard);
boardRouter.get('/board', getBoards);
boardRouter.get('/board/:id', getBoard);
boardRouter.delete('/board/:id', removeBoard);
boardRouter.put('/board/:id', updateBoard);
