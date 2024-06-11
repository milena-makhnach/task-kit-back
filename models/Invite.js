import sql from '../db.js';
import { DataTypes } from 'sequelize';
import { Board } from './Board.js';
import { User } from './User.js';

export const Invite = sql.define(
	'invite',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		invite_user_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				key: 'id',
				model: 'user',
			},
		},
		invited_user_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
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
		tableName: 'invite',
		timestamps: true,
		updatedAt: false,
		createdAt: 'created_at',
	}
);

Invite.belongsTo(Board, {
	foreignKey: 'board_id',
});
Invite.belongsTo(User, {
	foreignKey: 'invite_user_id',
	as: 'inviteUser',
});
Invite.belongsTo(User, {
	foreignKey: 'invited_user_id',
	as: 'invitedUser',
});

User.hasMany(Invite, { foreignKey: 'invited_user_id' });
User.hasMany(Invite, { foreignKey: 'invite_user_id' });
Board.hasMany(Invite, { foreignKey: 'board_id' });
