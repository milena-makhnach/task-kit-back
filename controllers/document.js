import { CommentDocument, Document, TaskDocument } from '../models/Document.js';

import path from 'path';

export const uploadTaskDocument = async (req, res) => {
	const file = req.file;
	const { task_id } = req.body;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const filePath = path.join(
			process.cwd(),
			'public',
			'files',
			file.filename
		);

		const document = await Document.create({
			name: file.originalname,
			file: filePath,
		});

		await TaskDocument.create({
			task_id,
			document_id: document.id,
		});

		res.status(201).send({
			...document.dataValues,
			id: document.id,
			task_id,
		});
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const uploadCommentDocument = async (req, res) => {
	const file = req.file;
	const { comment_id } = req.body;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const filePath = path.join(
			process.cwd(),
			'public',
			'files',
			file.filename
		);

		const document = await Document.create({
			name: file.originalname,
			file: filePath,
		});

		const doc = await CommentDocument.create({
			comment_id,
			document_id: document.id,
		});

		console.log(doc);

		res.status(201).send({ ...document.dataValues, id: document.id });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const deleteDocument = async (req, res) => {
	const { id } = req.params;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await Document.destroy({ where: { id } });

		res.status(200).send({ message: 'success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
