import jwt from 'jsonwebtoken';
import { Op, Sequelize } from 'sequelize';

import { Board } from '../models/Board.js';
import { User } from '../models/User.js';
import { Workspace, WorkspaceUser } from '../models/Workspace.js';
import { Invite } from '../models/Invite.js';
import { Label } from '../models/Label.js';
import { Photo } from '../models/Photo.js';
import { TaskUser } from '../models/TaskUser.js';

export const createBoard = async (req, res) => {
	const board = req.body;

	const user = await User.findOne({
		where: { email: req.body.email },
		attributes: {
			exclude: ['password'],
		},
	});

	const workspaceByUser = await WorkspaceUser.findOne({
		where: {
			user_id: user.id,
		},
	});

	const workspace = await Workspace.findOne({
		where: {
			id: workspaceByUser.dataValues.workspace_id,
		},
	});

	try {
		const newBoard = await Board.create({
			name: board.name,
			photo_id: board.photo_id || null,
			bg_color: board.bg_color || null,
			workspace_id: workspace.id,
			theme: board.theme,
		});

		const labels = await Label.bulkCreate([
			{ color: '#4BCE98', board_id: newBoard.id },
			{ color: '#F5CD47', board_id: newBoard.id },
			{ color: '#FFA362', board_id: newBoard.id },
			{ color: '#F8716B', board_id: newBoard.id },
			{ color: '#9F8FF2', board_id: newBoard.id },
			{ color: '#579CFF', board_id: newBoard.id },
		]);

		const {
			dataValues: { photo_id, ...boardData },
		} = newBoard;

		if (photo_id) {
			const photo = await Photo.findByPk(photo_id);

			if (photo) {
				return res.status(200).send({ ...boardData, labels, photo });
			}
		}

		return res.status(201).send({ ...boardData, labels, id: newBoard.id });
	} catch (e) {
		res.status(400).send({ message: e.message });
	}
};

export const getBoards = async (req, res) => {
	const user = await User.findOne({
		where: {
			email: req.body.email,
		},
		attributes: {
			exclude: ['password'],
		},
	});

	if (!user) {
		return res.status(403).send({ message: 'User not found' });
	}

	const workspaceByUser = await WorkspaceUser.findOne({
		where: {
			user_id: user.id,
		},
	});

	const workspace = await Workspace.findOne({
		where: {
			id: workspaceByUser.dataValues.workspace_id,
		},
	});

	try {
		const boards = await Board.findAll({
			where: {
				workspace_id: workspace.id,
			},
			include: [
				{
					model: Photo,
				},
			],
			raw: true,
		});

		const invitedBoards = await Board.findAll({
			include: [
				{
					model: Invite,
					where: { invited_user_id: user.id },
				},
				{ model: Photo },
			],
			raw: true,
		});

		const boardIds = boards.map((board) => board.id);
		const invites = await Invite.findAll({
			where: {
				board_id: {
					[Op.in]: boardIds,
				},
			},
			include: [
				{
					model: User,
					as: 'invitedUser',
					attributes: {
						exclude: ['password'],
					},
				},
				{
					model: User,
					as: 'inviteUser',
					attributes: {
						exclude: ['password'],
					},
				},
			],
			raw: true,
		});

		const formattedBoards = boards.map((board) => ({
			id: board.id,
			name: board.name,
			bg_color: board.bg_color,
			theme: board.theme,
			workspace_id: board.workspace_id,
			created_at: board.created_at,
			updated_at: board.updated_at,
			photo: board['photo.id']
				? {
						id: board['photo.id'],
						file: board['photo.file'],
						alt_desc: board['photo.alt_desc'],
				  }
				: null,
			users: [user.dataValues],
			invitedBoards: invitedBoards.map((board) => ({
				id: board.id,
				name: board.name,
				bg_color: board.bg_color,
				theme: board.theme,
				workspace_id: board.workspace_id,
				created_at: board.created_at,
				updated_at: board.updated_at,
				isInvited: true,
				photo: board['photo.id']
					? {
							id: board['photo.id'],
							file: board['photo.file'],
							alt_desc: board['photo.alt_desc'],
					  }
					: null,
			})),
		}));

		res.status(200).send(formattedBoards);
	} catch (e) {
		console.log(e);
		res.status(400).send({ message: e.message });
	}
};

export const getBoard = async (req, res) => {
	const { id } = req.params;

	const user = await User.findOne({
		where: { email: req.body.email },
		attributes: {
			exclude: ['password'],
		},
		raw: true,
	});

	try {
		const board = await Board.findOne({
			where: {
				id: id,
			},
			include: [
				{
					model: Label,
				},
			],
			order: [[{ model: Label }, 'updated_at', 'DESC']],
		});

		const invites = await Invite.findAll({
			where: {
				board_id: board.id,
			},
			include: [
				{
					model: User,
					as: 'invitedUser',
					attributes: {
						exclude: ['password'],
					},
				},
				{
					model: User,
					as: 'inviteUser',
					attributes: {
						exclude: ['password'],
					},
				},
			],
			raw: true,
		});

		const users = invites
			.map((item) => [
				{
					id: item['invitedUser.id'],
					first_name: item['invitedUser.first_name'],
					last_name: item[`invitedUser.last_name`],
					avatar: item[`invitedUser.avatar`],
					email: item[`invitedUser.email`],
					isInvited: true,
				},
				{
					id: item['inviteUser.id'],
					first_name: item['inviteUser.first_name'],
					last_name: item[`inviteUser.last_name`],
					avatar: item[`inviteUser.avatar`],
					email: item[`inviteUser.email`],
					isInvited: false,
				},
			])
			.flat();

		const {
			dataValues: { photo_id, ...boardData },
		} = board;

		if (photo_id) {
			const photo = await Photo.findByPk(photo_id);

			return res.status(200).send({
				...boardData,
				photo: photo || null,
				users: !!users.length ? users : [user],
			});
		}

		return res.status(200).send({
			...boardData,
			photo: null,
			users: !!users.length ? users : [user],
		});
	} catch (e) {
		console.log(e);
		res.status(400).send({ message: e.message });
	}
};

export const updateBoard = async (req, res) => {
	const { id } = req.params;
	const dataToUpdate = req.body;

	const user = await User.findOne({
		where: { email: req.body.email },
		attributes: { exclude: ['password'] },
	});

	const workspace = await Workspace.findOne({ user_id: user.id });

	try {
		await Board.update(dataToUpdate, {
			where: {
				[Op.and]: [{ workspace_id: workspace.id }, { id: id }],
			},
		});

		const board = await Board.findByPk(id, {
			include: [{ mode: Photo }],
		});

		const { photo, ...rest } = board.dataValues;

		const updatedBoard = { ...rest, photo: photo.photo };

		console.log(updatedBoard);

		res.status(200).send(updatedBoard);
	} catch (e) {
		res.status(400).send({ message: e.message });
	}
};

export const deleteUsersFromBoard = async (req, res) => {
	const { id } = req.params;
	const data = req.body;

	try {
		await Invite.destroy({
			where: {
				[Op.and]: [{ invited_user_id: data.user_id }, { board_id: id }],
			},
		});

		await TaskUser.destroy({
			where: {
				user_id: data.user_id,
			},
		});

		res.status(200).send({ message: 'User was successfully deleted' });
	} catch (e) {
		console.log(e);

		res.status(400).send({ message: e.message });
	}
};

export const removeBoard = async (req, res) => {
	const { id } = req.params;

	const user = await User.findOne({ where: { email: req.body.email } });

	const workspace = await Workspace.findOne({ user_id: user.id });

	try {
		await Label.destroy({
			where: {
				board_id: id,
			},
		});

		await Board.destroy({
			where: {
				[Op.and]: [{ workspace_id: workspace.id }, { id: id }],
			},
		});

		res.status(200).send({ message: 'Board successfully deleted' });
	} catch (e) {
		console.log(e);

		res.status(400).send({ message: e.message });
	}
};
