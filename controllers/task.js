import { Sequelize, Op, literal } from 'sequelize';
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

	try {
		const createdTask = await Task.create(taskData);

		const task = await Task.findByPk(createdTask.id, {
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
							attributes: {
								exclude: ['password'],
							},
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
				{
					model: TaskUser,
					include: [
						{
							model: User,
							attributes: {
								exclude: ['password'],
							},
						},
					],
				},
			],
		});

		const { task_documents, task_labels, task_users, ...rest } =
			task.dataValues;

		const responseData = {
			...rest,
			files: task_documents.map((item) => item.document),
			users: task_users.map((item) => item.user),
			labels: task_labels.map((item) => item.label),
		};

		res.status(201).send(responseData);
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const getAllTask = async (req, res) => {
	const { column_id } = req.params;

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
							attributes: {
								exclude: ['password'],
							},
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

		const user = await User.findOne({
			where: { email: req.body.email },
			attributes: {
				exclude: ['password'],
			},
			raw: true,
		});

		const users = await Invite.findAll({
			where: {
				board_id,
			},
			attributes: [],
			include: [
				{
					model: User,
					attributes: {
						exclude: ['password'],
					},
				},
			],
			raw: true,
			nest: true,
		});

		const filteredData = [...users.map((item) => item.user), user];

		const usersWithWorkingField = await Promise.all(
			filteredData.map(async (u) => {
				const isWorking = await TaskUser.findOne({
					where: {
						[Op.and]: [{ user_id: u.id }, { task_id: task_id }],
					},
					raw: true,
				});
				return { ...u, is_working: !!isWorking };
			})
		);

		const { task_documents, task_labels, task_users, ...rest } =
			task.dataValues;

		const responseData = {
			...rest,
			files: task_documents.map((item) => item.document),
			users: task_users.map((item) => item.user),
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

	try {
		const taskToDelete = await Task.findByPk(task_id);
		const taskColumnOrder = taskToDelete.dataValues.order;

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
		console.log('DELETE', err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const updateTask = async (req, res) => {
	const { task_id } = req.params;
	const dataToUpdate = req.body;

	try {
		await Task.update(dataToUpdate, {
			where: {
				id: task_id,
			},

			individualHooks: true,
		});

		const newTask = await Task.findByPk(task_id, {
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
							attributes: {
								exclude: ['password'],
							},
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
				{
					model: TaskUser,
					include: [
						{
							model: User,
							attributes: {
								exclude: ['password'],
							},
						},
					],
				},
			],
		});

		const { task_documents, task_labels, task_users, ...rest } =
			newTask.dataValues;

		const responseData = {
			...rest,
			files: task_documents.map((item) => item.document),
			users: task_users.map((item) => item.user),
			labels: task_labels.map((item) => item.label),
		};

		res.status(200).send(responseData);
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
