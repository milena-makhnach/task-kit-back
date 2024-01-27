import { DataTypes, Op } from 'sequelize';

import sql from '../db.js';
import { Photo } from './Photo.js';
import { Column } from './Column.js';

export const Task = sql.define(
	'task',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},
		bg_color: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},
		deadline: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null,
		},
		order: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		photo_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
			references: {
				model: 'photo',
				key: 'id',
			},
		},
		column_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'column',
				key: 'id',
			},
		},
	},
	{
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		tableName: 'task',
	}
);

Task.addHook('beforeUpdate', (task, options) => {
	if (task.changed('order')) {
		return sql.transaction(async (t) => {
			const prevOrder = task.previous('order');
			const newOrder = task.dataValues.order;

			if (prevOrder < newOrder) {
				await Task.decrement('order', {
					where: {
						column_id: task.dataValues.column_id,
						order: { [Op.between]: [prevOrder, newOrder] },
					},
					transaction: t,
				});
			} else {
				await Task.increment('order', {
					where: {
						column_id: task.dataValues.column_id,
						order: { [Op.between]: [newOrder, prevOrder] },
					},
					transaction: t,
				});
			}
		});
	}
});

Task.belongsTo(Column, { foreignKey: 'column_id' });
Photo.hasOne(Task, { foreignKey: 'photo_id' });
