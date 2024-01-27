import sql from '../db.js';
import { DataTypes } from 'sequelize';
import { User } from './User.js';
import { Task } from './Task.js';

export const Comment = sql.define(
	'comment',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		text: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		task_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		tableName: 'comment',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	}
);

Comment.belongsTo(User, { foreignKey: 'user_id' });
Comment.belongsTo(Task, { foreignKey: 'task_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Task.hasMany(Comment, { foreignKey: 'task_id' });
