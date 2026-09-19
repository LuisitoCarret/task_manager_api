import express from 'express';
import errorHandler from './src/utils/handleError.js';
import taskRouter from './src/routes/taskRoutes.js';

const app = express();
app.use(express.json());

app.use('/api',taskRouter);
app.use(errorHandler);

export default app;