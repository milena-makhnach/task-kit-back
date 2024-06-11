import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import * as router from './routes/index.js';
import db from './db.js';

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
		optionsSuccessStatus: 200,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		credentials: true,
		exposedHeaders: ['set-cookie'],
	})
);
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api/auth', router.authRouter);
app.use('/api/', router.boardRouter);
app.use('/api/', router.documentRouter);
app.use('/api/', router.photoRouter);
app.use('/api/', router.columnRouter);
app.use('/api/', router.taskRouter);
app.use('/api/', router.taskUserRouter);
app.use('/api/', router.commentRouter);
app.use('/api/', router.documentRouter);
app.use('/api/', router.labelRouter);

db.sync()
	.then(() => {
		console.log('DB is working');
		app.listen(PORT, (err) => {
			if (err) {
				console.log(err);
			} else {
				console.log('Server is working');
			}
		});
	})
	.catch((err) => console.log(`Db error: ${err.message}`));
