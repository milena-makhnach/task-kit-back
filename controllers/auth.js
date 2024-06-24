import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';

import { User } from '../models/User.js';
import { Workspace, WorkspaceUser } from '../models/Workspace.js';
import { Invite } from '../models/Invite.js';
import { mailer } from '../mailer.js';
import { Document } from '../models/Document.js';

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

		const accessToken = jwt.sign({ email }, process.env.JWT_ACCESS_KEY, {
			expiresIn: '1h',
		});

		const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_KEY, {
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
			return res.status(400).send({
				message: 'Invalid email or password',
			});
		}

		const accessToken = jwt.sign({ email }, process.env.JWT_ACCESS_KEY, {
			expiresIn: '1h',
		});
		const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_KEY, {
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

export const refresh = (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	const accessToken = req.cookies.accessToken;

	if (accessToken) {
		jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_KEY,
			(err, decoded) => {
				if (err) {
					return res.status(401).json({ message: 'Unauthorized' });
				} else {
					const accessToken = jwt.sign(
						{ email: decoded.email },
						process.env.JWT_ACCESS_KEY,
						{
							expiresIn: '1h',
						}
					);

					const refreshToken = jwt.sign(
						{ email: decoded.email },
						process.env.JWT_REFRESH_KEY,
						{
							expiresIn: '1d',
						}
					);

					return res
						.cookie('refreshToken', refreshToken, {
							httpOnly: true,
						})
						.cookie('accessToken', accessToken, { httpOnly: true })
						.status(200)
						.send();
				}
			}
		);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
};

export const getCurrentUser = async (req, res) => {
	const accessToken = req.cookies['accessToken'];

	try {
		if (accessToken) {
			const { email } = jwt.decode(accessToken);

			const user = await User.findOne({
				where: { email },
				attributes: {
					exclude: ['password'],
				},
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
	const file = req.file;

	if (!accessToken) {
		return res
			.clearCookie('accessToken')
			.clearCookie('refreshToken')
			.status(401)
			.send({
				message: 'Unauthorized',
			});
	}

	try {
		const { email } = jwt.decode(accessToken);

		if (file) {
			const filePath = path.join(
				process.cwd(),
				'public',
				'files',
				file.originalname
			);

			const document = await Document.create({
				name: file.originalname,
				file: filePath,
			});

			await User.update(
				{
					...dataToUpdate,
					avatar: document.id ? document.file : avatar,
				},
				{
					where: { email },
				}
			);
		} else {
			await User.update(dataToUpdate, {
				where: { email },
			});
		}

		const newUser = await User.findOne({
			where: { email },
			attributes: {
				exclude: ['password'],
			},
		});

		return res.status(200).send(newUser);
	} catch (err) {
		// res.clearCookie('accessToken')
		// 	.clearCookie('refreshToken')
		// 	.status(403)
		// 	.send({
		// 		message: 'User not found',
		// 	});
		console.log(err);
		res.status(403).send({
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
			return res.status(401).json({ error: 'Unauthorized' });
		}

		const invitation = await Invite.create({
			email,
			invite_user_id: user_id,
			board_id,
		});

		const inviteToken = jwt.sign(
			{ email, board_id, invite_id: invitation.id },
			process.env.INVITE_SECRET_KEY
		);

		const mailOptions = {
			from: invitingUser.dataValues.email,
			to: email,
			subject: 'Вы были приглашены в доску',
			html: `
			<p>
			Вы были приглашены в доску. Перейти по ссылке:
			<a
				href="
					${process.env.CLIENT_API}/verification/${inviteToken}
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
			code: inviteToken,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

export const checkForInvite = async (req, res) => {
	const { invite_token } = req.params;

	try {
		const decodedToken = jwt.decode(invite_token);

		const invite = await Invite.findByPk(decodedToken.invite_id);

		const invitedUser = await User.findOne({
			where: { email: invite.dataValues.email },
		});

		if (invitedUser) {
			await Invite.update(
				{ invited_user_id: invitedUser.id },
				{
					where: {
						id: invite.id,
					},
				}
			);

			await Work;

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
				.json({
					board_id: invite.dataValues.board_id,
				});
		}

		res.status(401)
			.json({
				error: 'Unauthenticated',
			})
			.redirect(`${process.env.CLIENT_API}/register`);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
