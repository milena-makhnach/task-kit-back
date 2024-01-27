import { Sequelize, Op } from 'sequelize';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { TaskUser } from '../models/TaskUser.js';

export const createUserTask = async (req, res) => {
	const { user_id, task_id } = req.body;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await TaskUser.create({
			user_id,
			task_id,
		});

		res.status(201).send({ message: 'success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const removeUserTask = async (req, res) => {
	const { user_id, task_id } = req.body;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await TaskUser.destroy({
			where: { [Op.and]: [{ user_id }, { task_id }] },
		});

		res.status(200).send({ message: 'success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
