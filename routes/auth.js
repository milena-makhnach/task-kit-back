import multer from 'multer';
import {
	register,
	login,
	logout,
	getCurrentUser,
	updateUser,
	inviteUser,
	checkForInvite,
	refresh,
} from '../controllers/auth.js';
import express from 'express';

export const authRouter = express.Router();

const upload = multer();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);
authRouter.post('/invite', inviteUser);
authRouter.post('/logout', logout);
authRouter.get('/user', getCurrentUser);
authRouter.post('/invite/:invite_token', checkForInvite);
authRouter.put('/user', upload.single('avatar'), updateUser);
