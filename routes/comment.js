import express from 'express';

import { createComment, deleteComment } from '../controllers/comment.js';

export const commentRouter = express.Router();

commentRouter.post('/comment', createComment);
commentRouter.delete('comment/:id', deleteComment);
