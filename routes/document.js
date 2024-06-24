import express from 'express';

import {
	uploadTaskDocument,
	uploadCommentDocument,
	deleteDocument,
} from '../controllers/document.js';
import { upload } from '../storage.js';
import { verifyToken } from '../middleware/verify-token.js';

export const documentRouter = express.Router();

documentRouter.post(
	'/task/upload',
	upload.single('file'),
	verifyToken,
	uploadTaskDocument
);
documentRouter.post(
	'comment/upload',
	upload.single('file'),
	verifyToken,
	uploadCommentDocument
);

documentRouter.delete('/document/:id', verifyToken, deleteDocument);
