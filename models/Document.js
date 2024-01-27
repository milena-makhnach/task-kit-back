import sql from '../db.js';
import { DataTypes } from 'sequelize';
import { Task } from './Task.js';
import { Comment } from './Comment.js';

export const Document = sql.define(
	'document',
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
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'document',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: false,
	}
);

export const TaskDocument = sql.define(
	'task_document',
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
				key: 'id',
				model: 'task',
			},
		},
		document_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				key: 'id',
				model: 'document',
			},
		},
	},
	{
		tableName: 'task_document',
		timestamps: false,
	}
);

export const CommentDocument = sql.define(
	'comment_document',
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		comment_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				key: 'id',
				model: 'comment',
			},
		},
		document_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				key: 'id',
				model: 'document',
			},
		},
	},
	{
		tableName: 'comment_document',
		timestamps: false,
	}
);

TaskDocument.belongsTo(Task, {
	foreignKey: 'task_id',
});

TaskDocument.belongsTo(Document, {
	foreignKey: 'document_id',
});

Task.hasMany(TaskDocument, { foreignKey: 'task_id' });
Document.hasMany(TaskDocument, { foreignKey: 'document_id' });

CommentDocument.belongsTo(Comment, {
	foreignKey: 'comment_id',
});

CommentDocument.belongsTo(Document, {
	foreignKey: 'document_id',
});

Comment.hasMany(CommentDocument, { foreignKey: 'comment_id' });
Document.hasMany(CommentDocument, { foreignKey: 'document_id' });
