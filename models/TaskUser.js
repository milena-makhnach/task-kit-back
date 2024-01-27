import sql from '../db.js';
import { DataTypes } from 'sequelize';
import { User } from './User.js';
import { Task } from './Task.js';

export const TaskUser = sql.define(
	'task_user',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'user',
				key: 'id',
			},
		},
		task_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'task',
				key: 'id',
			},
		},
	},
	{
		timestamps: false,
		tableName: 'task_user',
	}
);

TaskUser.belongsTo(User, {
	foreignKey: 'user_id',
});
TaskUser.belongsTo(Task, {
	foreignKey: 'task_id',
});

User.hasMany(TaskUser, { foreignKey: 'user_id' });
Task.hasMany(TaskUser, { foreignKey: 'task_id' });
