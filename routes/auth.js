import {
	register,
	login,
	logout,
	getCurrentUser,
	updateUser,
	inviteUser,
	checkForInvite,
} from '../controllers/auth.js';
import express from 'express';

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/invite', inviteUser);
authRouter.post('/logout', logout);
authRouter.get('/user', getCurrentUser);
authRouter.get('/invite/:invite_id', checkForInvite);
authRouter.put('/user', updateUser);
