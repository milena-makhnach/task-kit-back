import sql from '../db.js';
import { DataTypes } from 'sequelize';

import { Photo } from './Photo.js';
import { Workspace } from './Workspace.js';

export const Board = sql.define(
	'board',
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
		bg_color: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
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
		workspace_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'workspace',
				key: 'id',
			},
		},
	},
	{
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
		tableName: 'board',
	}
);

Board.belongsTo(Workspace, { foreignKey: 'workspace_id' });
Photo.hasOne(Board, { foreignKey: 'photo_id' });

