import { Router } from "express";
import { taskControl } from "../controllers/taskController.js";

const taskRouter = Router();

taskRouter.get('/tasks',taskControl.getAll);
taskRouter.get('/tasks/:id',taskControl.getById);
taskRouter.post('/tasks',taskControl.create);
taskRouter.patch('/tasks/:id',taskControl.update);
taskRouter.delete('/tasks/:id',taskControl.delete);

export default taskRouter;