import express from 'express';

import {
	createComment,
	deleteComment,
	updateComment,
} from '../controllers/comment.js';
import { verifyToken } from '../middleware/verify-token.js';

export const commentRouter = express.Router();

commentRouter.post('/comment', verifyToken, createComment);
commentRouter.delete('/comment/:id', verifyToken, deleteComment);
commentRouter.patch('/comment/:id', verifyToken, updateComment);
