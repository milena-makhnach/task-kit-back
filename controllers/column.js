import { Op, literal } from 'sequelize';

import { Column } from '../models/Column.js';
import { Task } from '../models/Task.js';

export const createColumn = async (req, res) => {
	const { board_id } = req.params;
	const { name, order } = req.body;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const column = await Column.create({
			name,
			order,
			board_id,
		});

		res.status(201).send(column.dataValues);
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};

export const getAllColumns = async (req, res) => {
	const { board_id } = req.params;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const columns = await Column.findAll({
			row: true,
			where: { board_id: board_id },
			order: [['order', 'ASC']],
		});

		const columnsWithTasks = await Promise.all(
			columns.map(async (column) => {
				const { id } = column;
				if (id) {
					const tasks = await Task.findAll({
						row: true,
						where: { column_id: id },
						order: [['order', 'ASC']],
					});

					return { ...column.dataValues, tasks };
				} else {
					return column;
				}
			})
		);

		res.status(200).send(columnsWithTasks);
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};

export const removeColumn = async (req, res) => {
	const { column_id, board_id } = req.params;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const columnToDelete = await Column.findByPk(column_id);
		const deleteColumnOrder = columnToDelete.order;

		await Column.destroy({
			where: { [Op.and]: [{ board_id: board_id }, { id: column_id }] },
		});

		await Column.update(
			{ order: literal('`order` - 1') },
			{
				where: { order: { [Op.gt]: deleteColumnOrder } },
			}
		);

		res.status(200).send({ message: 'Column deleted successfully' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const updateColumn = async (req, res) => {
	const { board_id, column_id } = req.params;
	const dataToUpdate = req.body;
	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await Column.update(dataToUpdate, {
			where: { [Op.and]: [{ board_id: board_id }, { id: column_id }] },
			individualHooks: true,
		});

		const newColumn = await Column.findByPk(column_id);

		res.status(200).send(newColumn);
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
