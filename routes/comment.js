import express from 'express';

import {
	createComment,
	deleteComment,
	updateComment,
} from '../controllers/comment.js';

export const commentRouter = express.Router();

commentRouter.post('/comment', createComment);
commentRouter.delete('/comment/:id', deleteComment);
commentRouter.patch('/comment/:id', updateComment);
