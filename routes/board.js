import express from 'express';

import {
	createBoard,
	getBoards,
	getBoard,
	removeBoard,
	updateBoard,
	deleteUsersFromBoard,
} from '../controllers/board.js';
import { verifyToken } from '../middleware/verify-token.js';

export const boardRouter = express.Router();

boardRouter.post('/board', verifyToken, createBoard);
boardRouter.get('/board', verifyToken, getBoards);
boardRouter.get('/board/:id', verifyToken, getBoard);
boardRouter.delete('/board/:id', verifyToken, removeBoard);
boardRouter.put('/board/:id', verifyToken, updateBoard);
boardRouter.post('/board/:id', verifyToken, deleteUsersFromBoard);
