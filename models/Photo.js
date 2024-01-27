import sql from '../db.js';
import { DataTypes } from 'sequelize';

export const Photo = sql.define(
	'photo',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		file: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		alt_desc: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'photo',
		timestamps: false,
	}
);

Photo.sync({ alter: true });
