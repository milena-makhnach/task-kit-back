import sql from '../db.js';
import { DataTypes } from 'sequelize';

import { User } from './User.js';

export const Workspace = sql.define(
	'workspace',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'workspace',
		},
	},
	{
		timestamps: false,
		tableName: 'workspace',
	}
);

export const WorkspaceUser = sql.define(
	'workspace_user',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		workspace_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'workspace',
				key: 'id',
			},
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'user',
				key: 'id',
			},
		},
	},
	{
		timestamps: false,
		tableName: 'workspace_user',
	}
);

User.belongsToMany(Workspace, { through: WorkspaceUser });
Workspace.belongsToMany(User, { through: WorkspaceUser });
