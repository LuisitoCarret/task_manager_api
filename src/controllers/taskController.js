import { taskService } from "../services/taskService.js"

export const taskControl = {
    async getAll(req,res,next){
        try {
            const {limit,page,completed} = req.query;
            const tasks = await taskService.getAllTasks({limit,page,completed});
            res.status(200).json({
                success:true,
                ...tasks
            });
        } catch (error) {
            next(error);
        }
    },

    async getById(req,res,next){
        try {
            const taskId = parseInt(req.params.id);
            const task = await taskService.getTaskById(taskId);
            res.status(200).json({
               succes:true,
               data:task
            });
        } catch (error) {
           next(error);
        }
    },

    async create(req,res,next){
      try {
        const {title,descriptiontsk} = req.body;
        await taskService.createTask(title,descriptiontsk);
        res.status(201).json({
            succes:true,
            message:'Task created successfully'
        });
      } catch (error) {
        next(error);
      }
    },

    async update(req,res,next){
        try {
            const taskId = parseInt(req.params.id);
            await taskService.updateTask(taskId,req.body);
            res.status(200).json({
              succes:true,
              message:'Task updated successfully'
            });
        } catch (error) {
          next(error);
        }
    },

    async delete(req,res,next){
        try {
            const taskId = parseInt(req.params.id);
            await taskService.deleteTask(taskId);
            res.status(200).json({
               succes:true,
               message:'Task deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}