import { DataTypes, Op } from 'sequelize';

import sql from '../db.js';
import { Board } from './Board.js';

export const Column = sql.define(
	'column',
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
		order: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		board_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'board',
				key: 'id',
			},
		},
	},
	{
		timestamps: false,
		tableName: 'column',
	}
);

Column.belongsTo(Board, { foreignKey: 'board_id' });

Column.addHook('beforeUpdate', (column, options) => {
	if (column.changed('order')) {
		return sql.transaction(async (t) => {
			const prevOrder = column.previous('order');
			const newOrder = column.dataValues.order;

			if (prevOrder < newOrder) {
				await Column.decrement('order', {
					where: {
						board_id: column.dataValues.board_id,
						order: { [Op.between]: [prevOrder, newOrder] },
					},
					transaction: t,
				});
			} else {
				await Column.increment('order', {
					where: {
						board_id: column.dataValues.board_id,
						order: { [Op.between]: [newOrder, prevOrder] },
					},
					transaction: t,
				});
			}
		});
	}
});
