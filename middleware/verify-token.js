import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
	const token = req.cookies.accessToken;

	if (!token) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
		if (err) {
			return res.status(401).json({ message: 'Unauthorazed' });
		}
		req.body.email = decoded.email;

		next();
	});
};
