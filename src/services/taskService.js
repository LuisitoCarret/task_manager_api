import {
  AppError,
  NotFoundError,
  ValidationError,
} from "../errors/AppError.js";
import { taskRepo } from "../repositories/taskRepository.js";

export const taskService = {
  async getAllTasks({ limit, page, completed }) {
    let limitNew = parseInt(limit);
    let pageNew = parseInt(page);

    if (
      typeof pageNew !== "number" ||
      !pageNew ||
      isNaN(pageNew) ||
      pageNew <= 0
    ) {
      pageNew = 1;
    }
    if (
      typeof pageNew !== "number" ||
      !limitNew ||
      isNaN(limitNew) ||
      limitNew <= 0
    ) {
      limitNew = 10;
    }

    const skip = (pageNew - 1) * limitNew;

    if (completed === "true") {
      completed = true;
    } else if (completed === "false") {
      completed = false;
    } else {
      completed = undefined;
    }

    const tasks = await taskRepo.findAll(skip, limitNew, completed);
    const totalItems = await taskRepo.total(completed);
    const totalPage = Math.ceil(totalItems / limitNew);
    const result = {
      data: tasks || [],
      pagination: {
        page: pageNew,
        totalPage: totalPage,
        totalItems: totalItems,
      },
    };
    return result;
  },

  async getTaskById(id) {
    if (typeof id !== "number" || id <= 0 || isNaN(id))
      throw new ValidationError("Id invalid");
    const task = await taskRepo.findOne(id);
    if (!task) throw new NotFoundError("Task not found or this task might not exists");

    return task;
  },

  async createTask(title, descriptiontsk) {
    if (typeof title !== "string" || !title || title.trim() === "")
      throw new ValidationError(
        "The title field are required and cannot be empty. It must be string",
      );
    if (
      typeof descriptiontsk !== "string" ||
      !descriptiontsk ||
      descriptiontsk.trim() === ""
    )
      throw new ValidationError(
        "The description field are required and cannot be empty.It must be string",
      );
    return await taskRepo.create({
      title: title.trim(),
      descriptiontsk: descriptiontsk.trim(),
    });
  },

  async updateTask(id, changes) {
    if (typeof id !== "number" || id <= 0 || isNaN(id))
      throw new ValidationError("Id invalid");

    const task = await taskRepo.findOne(id);

    if (!task) throw new NotFoundError("Task not found");

    const allowedFiels = ["title", "descriptiontsk", "completed"];
    const data = {};

    for (const field of allowedFiels) {
      if (changes[field] != undefined) {
        data[field] = changes[field];
      }
    }

    if (Object.keys(data).length === 0)
      throw new ValidationError("There are not fields to update");

    return await taskRepo.update(id, data);
  },

  async deleteTask(id) {
    if (typeof id !== "number" || id <= 0 || isNaN(id))
      throw new ValidationError("Id invalid");

    const task = await taskRepo.findOne(id);

    if (!task) throw new NotFoundError("Task not found or this task might not exists");

    await taskRepo.delete(id);
  },
};
