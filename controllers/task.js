import { Sequelize, Op } from 'sequelize';
import { Invite } from '../models/Invite.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { TaskUser } from '../models/TaskUser.js';
import jwt from 'jsonwebtoken';
import { Document, TaskDocument } from '../models/Document.js';
import { Comment } from '../models/Comment.js';
import { Label, TaskLabel } from '../models/Label.js';

export const createTask = async (req, res) => {
	const taskData = req.body;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const task = await Task.create(taskData);

		res.status(201).send({ id: task.id, ...task.dataValues });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const getAllTask = async (req, res) => {
	const { column_id } = req.params;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const tasks = await Task.findAll({
			row: true,
			where: { column_id: column_id },
			order: [['order', 'ASC']],
		});

		res.status(200).send(tasks);
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};

export const getTask = async (req, res) => {
	const { task_id, board_id } = req.params;
	const accessToken = req.cookies['accessToken'];

	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const task = await Task.findByPk(task_id, {
			include: [
				{
					model: TaskDocument,
					include: [
						{
							model: Document,
						},
					],
				},
				{
					model: Comment,
					include: [
						{
							model: User,
						},
					],
				},
				{
					model: TaskLabel,
					include: [
						{
							model: Label,
						},
					],
				},
			],
		});

		const users = await User.findAll({
			include: [
				{
					model: Invite,
					where: {
						invited_user_id: Sequelize.col('user.id'),
						board_id: board_id,
					},
					attributes: [],
					required: true,
				},
			],
			raw: true,
		});

		const user = await User.findOne({ where: { email }, raw: true });

		const usersWithWorkingField = await Promise.all(
			[...users, user].map(async (u) => {
				const isWorking = await TaskUser.findOne({
					where: {
						[Op.and]: [{ user_id: u.id }, { task_id: task_id }],
					},
					raw: true,
				});
				return { ...u, is_working: !!isWorking };
			})
		);

		const filteredData = usersWithWorkingField.filter(
			(value, index, self) =>
				self.findIndex((v) => v.id === value.id) === index
		);

		const { task_documents, task_labels, ...rest } = task.dataValues;

		const responseData = {
			...rest,
			files: task_documents.map((td) => td.document),
			users: filteredData,
			labels: task_labels.map((item) => item.label),
		};

		res.status(200).send(responseData);
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const removeTask = async (req, res) => {
	const { task_id } = req.params;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const taskToDelete = await Task.findByPk(task_id);
		const taskColumnOrder = taskToDelete.order;

		await Task.destroy({
			where: { id: task_id },
		});

		await Task.update(
			{ order: literal('`order` - 1') },
			{
				where: { order: { [Op.gt]: taskColumnOrder } },
			}
		);

		res.status(200).send({ message: 'Task deleted successfully' });
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};

export const updateTask = async (req, res) => {
	const { task_id } = req.params;
	const dataToUpdate = req.body;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await Task.update(dataToUpdate, {
			where: {
				id: task_id,
			},

			individualHooks: true,
		});

		const newTask = await Task.findByPk(task_id);

		res.status(200).send(newTask);
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
