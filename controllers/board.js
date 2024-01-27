import jwt from 'jsonwebtoken';
import { Op, Sequelize } from 'sequelize';

import { Board } from '../models/Board.js';
import { User } from '../models/User.js';
import { Workspace, WorkspaceUser } from '../models/Workspace.js';
import { Photo } from '../models/Photo.js';
import { Invite } from '../models/Invite.js';
import { Label } from '../models/Label.js';

export const createBoard = async (req, res) => {
	const board = req.body;
	const accessToken = req.cookies['accessToken'];
	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	const user = await User.findOne({ email });
	const workspace = await Workspace.findOne({ user_id: user.id });

	try {
		const newBoard = await Board.create({
			name: board.name,
			photo_id: board.photo_id || null,
			bg_color: board.bg_color || null,
			workspace_id: workspace.id,
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
				res.status(200).send({ ...boardData, labels, photo });
			}
		}

		res.status(201).send({ ...boardData, id: newBoard.id });
	} catch (e) {
		res.status(400).send({ message: e.message });
	}
};

export const getBoards = async (req, res) => {
	const accessToken = req.cookies['accessToken'];
	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	const user = await User.findOne({
		where: {
			email,
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
				workspace_id: workspace.dataValues.id,
			},
			raw: true,
		});

		const boardsWithPhotos = await Promise.all(
			boards.map(async (board) => {
				const { photo_id, ...boardData } = board;
				if (photo_id) {
					const photo = await Photo.findByPk(photo_id);

					return { ...boardData, photo };
				} else {
					return board;
				}
			})
		);

		res.status(200).send(boardsWithPhotos);
	} catch (e) {
		res.status(400).send({ message: e.message });
	}
};

export const getBoard = async (req, res) => {
	const { id } = req.params;

	const accessToken = req.cookies['accessToken'];
	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	const user = await User.findOne({ where: { email }, raw: true });

	const workspace = await Workspace.findOne({ user_id: user.id });

	try {
		const board = await Board.findOne({
			where: {
				[Op.and]: [{ workspace_id: workspace.id }, { id: id }],
			},
			include: [
				{
					model: Label,
				},
			],
			order: [[{ model: Label }, 'updated_at', 'DESC']],
		});

		const users = await User.findAll({
			include: [
				{
					model: Invite,
					where: {
						invited_user_id: Sequelize.col('user.id'),
						board_id: id,
					},
					attributes: [],
					required: true,
				},
			],
			raw: true,
		});

		const filteredData = [...users, user].filter(
			(value, index, self) =>
				self.findIndex((v) => v.id === value.id) === index
		);

		const {
			dataValues: { photo_id, ...boardData },
		} = board;

		if (photo_id) {
			const photo = await Photo.findByPk(photo_id);

			if (photo) {
				return res
					.status(200)
					.send({ ...boardData, photo, users: filteredData });
			}
		}

		res.status(200).send({ ...boardData, users: filteredData });
	} catch (e) {
		console.log(e);
		res.status(400).send({ message: e.message });
	}
};

export const updateBoard = async (req, res) => {
	const { id } = req.params;
	const dataToUpdate = erq.body;

	const accessToken = req.cookies['accessToken'];
	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	const user = await User.findOne({ where: { email } });

	const workspace = await Workspace.findOne({ user_id: user.id });

	try {
		await Board.update(dataToUpdate, {
			where: {
				[Op.and]: [{ workspace_id: workspace.id }, { id: id }],
			},
		});

		const board = await Board.findByPk(id);

		res.status(200).send(board);

		res.status(200).send({ message: 'Board successfully deleted' });
	} catch (e) {
		console.log(e);

		res.status(400).send({ message: e.message });
	}
};

export const removeBoard = async (req, res) => {
	const { id } = req.params;

	const accessToken = req.cookies['accessToken'];
	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	const user = await User.findOne({ where: { email } });

	const workspace = await Workspace.findOne({ user_id: user.id });

	try {
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
