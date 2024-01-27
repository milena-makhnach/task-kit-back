import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../models/User.js';
import { Workspace, WorkspaceUser } from '../models/Workspace.js';
import { Invite } from '../models/Invite.js';
import { mailer } from '../mailer.js';

export const register = async (req, res) => {
	const { password, lastname, firstname, email } = req.body;

	const salt = await bcrypt.genSalt(10);
	const hashaedPassword = await bcrypt.hash(password, salt);

	try {
		const user = await User.create({
			last_name: lastname,
			first_name: firstname,
			email,
			password: hashaedPassword,
		});

		if (!user) {
			return res.status(400).send({ message: 'Invalid credentials' });
		}

		const workspace = await Workspace.create();

		await WorkspaceUser.create({
			workspace_id: workspace.id,
			user_id: user.id,
		});

		const accessToken = jwt.sign({ email }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: '12h',
		});

		const refreshToken = jwt.sign({ email }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: '1d',
		});

		const {
			dataValues: { password: _, ...userData },
		} = user;

		res.cookie('accessToken', accessToken, { httpOnly: true });
		res.cookie('refreshToken', refreshToken, { httpOnly: true });
		res.status(201).send(userData);
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'User is already exists' });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({
			where: { email },
		});

		if (!user) {
			return res.status(403).send({
				message: 'User not found',
			});
		}

		const isPasswordCorrect = await bcrypt.compare(
			password,
			user.dataValues.password
		);

		if (!isPasswordCorrect) {
			return res.status(401).send({
				message: 'Invalid email or password',
			});
		}

		const accessToken = jwt.sign({ email }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: '1h',
		});
		const refreshToken = jwt.sign({ email }, process.env.TOKEN_SECRET_KEY, {
			expiresIn: '1d',
		});

		const { password: _, ...userData } = user.dataValues;

		res.cookie('refreshToken', refreshToken, { httpOnly: true })
			.cookie('accessToken', accessToken, { httpOnly: true })
			.status(200)
			.send(userData);
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};

export const getCurrentUser = async (req, res) => {
	const accessToken = req.cookies['accessToken'];

	try {
		if (accessToken) {
			const { email } = jwt.decode(accessToken);

			const user = await User.findOne({
				where: { email },
			});

			if (!user) {
				return res
					.clearCookie('accessToken')
					.clearCookie('refreshToken')
					.status(403)
					.send({
						message: 'User not found',
					});
			}
			const { password: _, ...userData } = user.dataValues;
			return res.status(200).send(userData);
		}
	} catch (err) {
		res.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.status(403)
			.send({
				message: 'User not found',
			});
	}
};

export const updateUser = async (req, res) => {
	const accessToken = req.cookies['accessToken'];
	const dataToUpdate = req.body;

	try {
		if (accessToken) {
			const { email } = jwt.decode(accessToken);

			const user = await User.findOne({
				where: { email },
			});

			if (!user) {
				return res
					.clearCookie('accessToken')
					.clearCookie('refreshToken')
					.status(403)
					.send({
						message: 'User not found',
					});
			}

			await User.update(dataToUpdate, { where: { email } });

			const newUser = await User.findOne({
				where: { email },
			});

			const { password: _, ...userData } = newUser.dataValues;
			return res.status(200).send(userData);
		}
	} catch (err) {
		res.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.status(403)
			.send({
				message: 'User not found',
			});
	}
};

export const logout = (_, res) => {
	res.clearCookie('accessToken');
	res.clearCookie('refreshToken');
	res.status(200).send({ message: 'success' });
};

export const inviteUser = async (req, res) => {
	const { email, user_id, board_id } = req.body;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const invitingUser = await User.findByPk(user_id);

		if (!invitingUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		const invitation = await Invite.create({
			email,
			invite_user_id: user_id,
			board_id,
		});

		const mailOptions = {
			from: invitingUser.dataValues.email,
			to: email,
			subject: 'Вы были приглашены в доску',
			html: `
			<p>
			Вы были приглашены в доску. Перейти по ссылке:
			<a
				href="
					${process.env.API_LINK}/api/auth/invite/${invitation.id}
				">
				Ссылка
			</a>
		</p>
			`,
		};

		mailer.sendMail(mailOptions, (error, info) => {
			if (error) {
				res.status(500).json({
					error: 'Failed to send invitation email',
				});
			} else {
				res.status(201).json({ invitation });
			}
		});

		res.status(201).json({
			id: invitation.id,
			...invitation.dataValues,
			url: `${process.env.API_LINK}/api/auth/invite/${invitation.id}`,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const checkForInvite = async (req, res) => {
	const { invite_id } = req.params;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const invite = await Invite.findByPk(invite_id);

		const invitedUser = await User.findOne({
			where: { email: invite.dataValues.email },
		});

		if (invitedUser) {
			const accessToken = jwt.sign(
				{ email: invite.dataValues.email },
				process.env.TOKEN_SECRET_KEY,
				{
					expiresIn: '12h',
				}
			);

			const refreshToken = jwt.sign(
				{ email: invite.dataValues.email },
				process.env.TOKEN_SECRET_KEY,
				{
					expiresIn: '1d',
				}
			);
			return res
				.cookie('refreshToken', refreshToken, { httpOnly: true })
				.cookie('accessToken', accessToken, { httpOnly: true })
				.status(200)
				.redirect(
					`http://localhost:3000/board/${invite.dataValues.board_id}`
				);
		}

		res.status(401).json({
			error: 'Unauthenticated',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
