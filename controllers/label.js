import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Label, TaskLabel } from '../models/Label.js';

export const setTaskLabel = async (req, res) => {
	const { task_id, label_id } = req.body;

	try {
		await TaskLabel.create({ task_id, label_id });

		res.status(200).send({ message: 'Success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const removeTaskLable = async (req, res) => {
	const { task_id, label_id } = req.params;

	try {
		await TaskLabel.destroy({
			where: { [Op.and]: [{ task_id }, { label_id }] },
		});

		res.status(200).send({ message: 'Success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const createLabel = async (req, res) => {
	const label = req.body;

	try {
		const newLabel = await Label.create(label);

		res.status(200).send({ ...newLabel.dataValues, id: newLabel.id });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const deleteLabel = async (req, res) => {
	const { id } = req.params;
	const accessToken = req.cookies['accessToken'];

	let email;

	if (accessToken) {
		email = jwt.decode(accessToken).email;
	} else {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await Label.destroy({
			where: { id },
		});

		res.status(200).send({ message: 'Success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const updateLabel = async (req, res) => {
	const label = req.body;
	const { id } = req.params;
	
	try {
		const updatedLabel = await Label.update(label, {
			where: { id },
		});

		res.status(200).send({ ...updatedLabel.dataValues });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
