import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';

export const createComment = async (req, res) => {
	const data = req.body;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		const comment = await Comment.create(data);

		const newComment = await Comment.findByPk(comment.id, {
			include: [{ model: User }],
		});

		res.status(200).send({ ...newComment.dataValues, id: newComment.id });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};

export const deleteComment = async (req, res) => {
	const { id } = req.params;

	const accessToken = req.cookies['accessToken'];

	if (!accessToken) {
		return res.status(401).send({ message: 'Unauthorazed' });
	}

	try {
		await Comment.delete({ where: { id } });

		res.status(200).send({ message: 'success' });
	} catch (err) {
		console.log(err);
		res.status(400).send({ message: 'Bad request' });
	}
};
