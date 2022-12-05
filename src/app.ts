import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from './routes/auth.route';
import { connectDB } from './config/db';
import bodyParser from 'body-parser';
import todoRouter from './routes/todo.route';

const app = express();
app.use(express.json());
// Config
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/todo', todoRouter);

app.use((req, res, next) => {
  return res.status(404).json({
    message: 'Route not found ! ',
  });
});

const start = (): void => {
  try {
    app.listen(3333, () => {
      console.log('Server started on port 3333');
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
start();
