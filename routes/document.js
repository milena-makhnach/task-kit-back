import express from 'express';

import {
	uploadTaskDocument,
	uploadCommentDocument,
	deleteDocument,
} from '../controllers/document.js';
import { upload } from '../storage.js';

export const documentRouter = express.Router();

documentRouter.post('/task/upload', upload.single('file'), uploadTaskDocument);
documentRouter.post(
	'comment/upload',
	upload.single('file'),
	uploadCommentDocument
);

documentRouter.delete('/document/:id', deleteDocument);
