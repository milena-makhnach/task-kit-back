import { Photo } from '../models/Photo.js';

export const postPhoto = async (req, res) => {
	const { file, alt_desc } = req.body;

	try {
		const photo = await Photo.create({
			file,
			alt_desc,
		});

		res.status(201).send(photo.dataValues);
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};

export const getPhotos = async (_, res) => {
	try {
		const photos = await Photo.findAll({ row: true });

		res.status(200).send(photos);
	} catch (err) {
		res.status(400).send({ message: 'Bad request' });
	}
};
