import { DataTypes, Op } from 'sequelize';

import sql from '../db.js';
import { Task } from './Task.js';
import { Board } from './Board.js';

export const Label = sql.define(
	'label',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		color: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		board_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				key: 'id',
				model: 'board',
			},
		},
	},
	{
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		tableName: 'label',
	}
);

Label.belongsTo(Board, {
	foreignKey: 'board_id',
});

Board.hasMany(Label, {
	foreignKey: 'board_id',
});

export const TaskLabel = sql.define(
	'task_label',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		task_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'task',
				key: 'id',
			},
		},
		label_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'label',
				key: 'id',
			},
		},
	},
	{
		timestamps: false,
		tableName: 'task_label',
	}
);

TaskLabel.belongsTo(Label, {
	foreignKey: 'label_id',
});

TaskLabel.belongsTo(Task, {
	foreignKey: 'task_id',
});

Task.hasMany(TaskLabel, { foreignKey: 'task_id' });
Label.hasMany(TaskLabel, { foreignKey: 'label_id' });
