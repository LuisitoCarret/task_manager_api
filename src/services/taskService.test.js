import { NotFoundError, ValidationError } from "../errors/AppError";
import { prisma } from "../lib/prisma";
import { taskRepo } from "../repositories/taskRepository";
import { taskService } from "./taskService";

jest.mock("../repositories/taskRepository");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("getAllTask",()=>{
  test("validate response",async()=>{
    const mockedTasks=[
        {
        id:3,
        title:'Search a job',
        descriptiontsk:'Before the year ends',
        completed:false
      },
      {
        id:2,
        title:'Do exercise',
        descriptiontsk:'Every day once do exercise',
        completed:true
      }
    ];
    taskRepo.findAll.mockResolvedValue(mockedTasks);
    taskRepo.total.mockResolvedValue(2);

    const result = await taskService.getAllTasks({ page: 1, limit: 10 });

    expect(result.data).toEqual(mockedTasks);
    expect(result.data).toHaveLength(2);
    expect(taskRepo.findAll).toHaveBeenCalledTimes(1);
  });

  test("validate response with completed is true",async ()=>{
    const mockedTasksTrue=[{
      id:2,
      title:'Do exercise',
      descriptiontsk:'Every day once do exercise',
      completed:true
    }];
    taskRepo.findAll.mockResolvedValue(mockedTasksTrue);
    taskRepo.total.mockResolvedValue(1);

    const result = await taskService.getAllTasks({ limit:10,page:1,completed: 'true' });

    expect(result.data).toEqual(mockedTasksTrue);
    expect(taskRepo.total).toHaveBeenCalledWith(true);
    expect(result.data).toHaveLength(1);
    expect(taskRepo.findAll).toHaveBeenCalledWith(0,10,true);
  });

  test("validate response with completed is false",async()=>{
    const mockedTasksFalse=[{
      id:2,
      title:'Do exercise',
      descriptiontsk:'Every day once do exercise',
      completed:false
    }];
    taskRepo.findAll.mockResolvedValue(mockedTasksFalse);
    taskRepo.total.mockResolvedValue(1);

    const result = await taskService.getAllTasks({ limit: 10, page:1 ,completed: 'false' });

    expect(result.data).toEqual(mockedTasksFalse);
    expect(taskRepo.total).toHaveBeenCalledWith(false);
    expect(result.data).toHaveLength(1);
    expect(taskRepo.findAll).toHaveBeenCalledWith(0,10,false);
  });
});

describe("getTasksById", () => {
  test("invalid ID", async () => {
    await expect(taskService.getTaskById(-1)).rejects.toThrow(ValidationError);
    expect(taskRepo.findOne).not.toHaveBeenCalled();
  });

  test("the data not exist", async () => {
    taskRepo.findOne.mockResolvedValue(undefined);
    await expect(taskService.getTaskById(999)).rejects.toThrow(NotFoundError);
  });

  test('Found a Task',async()=>{
    const mockedOneTask = {
       id:4,
       title:'Watch informative videos',
       descriptiontsk:'I need focus on teaching a specific topic',
       completed:false
    };

    taskRepo.findOne.mockResolvedValue(mockedOneTask);

    const result = await taskService.getTaskById(4);

    expect(result).toEqual(mockedOneTask);
    expect(taskRepo.findOne).toHaveBeenCalledWith(4);
  });
});

describe("createTask", () => {
  test('Title field is invalid',async()=>{
    await expect(taskService.createTask(12,'Searching new topics')).rejects.toThrow(ValidationError);
    expect(taskRepo.create).not.toHaveBeenCalled();    
  });

  test('Description field is invalid',async()=>{
     await expect(taskService.createTask('Learn Python',23)).rejects.toThrow(ValidationError);
     expect(taskRepo.create).not.toHaveBeenCalled();
  });

  test("Create a task",async()=>{
    const data={
      title:'Practice speak English',
      descriptiontsk:'Every day for 20 minutes speak English',
    };
    const mockedTaskCreate={
      id:3,
      ...data,
      completed:false
    };

    taskRepo.create.mockResolvedValue(mockedTaskCreate);

    const result = await taskService.createTask(data.title,data.descriptiontsk);

    expect(result).toEqual(mockedTaskCreate);
    expect(taskRepo.create).toHaveBeenCalledWith({title:data.title,descriptiontsk:data.descriptiontsk});
  });
});

describe("updateTask", () => {
  test("invalid ID", async () => {
    await expect(taskService.updateTask()).rejects.toThrow(ValidationError);
    expect(taskRepo.update).not.toHaveBeenCalled();
  });

  test("the data no exist", async () => {
    taskRepo.findOne.mockResolvedValue(undefined);
    await expect(taskService.updateTask(999)).rejects.toThrow(NotFoundError);
  });

  test("None fields to update", async () => {
    taskRepo.findOne.mockResolvedValue({
      id: 1,
      title: "Task of work",
      descriptiontsk: "Hard work to learn new things",
      completed: false,
    });
    await expect(taskService.updateTask(1, {})).rejects.toThrow(ValidationError);
  });

  test("update task successfully",async()=>{
    const mockedTask ={
      id:1,
      title:'Task of work',
      descriptiontsk:'Hard work to learn new things',
      completed:false
    };

    const updateTask={
      ...mockedTask,
      title:'New title'
    };

    taskRepo.findOne.mockResolvedValue(mockedTask);
    taskRepo.update.mockResolvedValue(updateTask);

    const result = await taskService.updateTask(1,{title:'New task'});

    expect(result).toEqual(updateTask);
    expect(taskRepo.update).toHaveBeenCalledWith(1,{title:'New task'});
  });

  test('fields that are not allowed',async ()=>{
     const mockedTask = {
        id: 1,
        title: "Task of work",
        descriptiontsk: "Hard work to learn new things",
        completed: false,
      };

      taskRepo.findOne.mockResolvedValue(mockedTask);

    await expect(taskService.updateTask(1,{titlesk:'Test title',id:999,password:'1234'})).rejects.toThrow(ValidationError);
    expect(taskRepo.update).not.toHaveBeenCalled();
  });

});

describe("deleteTask", () => {
  test("invalid ID", async () => {
    await expect(taskService.deleteTask()).rejects.toThrow(ValidationError);
  });

  test("the data not exist", async () => {
    taskRepo.findOne.mockResolvedValue(undefined);
    await expect(taskService.deleteTask(999)).rejects.toThrow(NotFoundError);
  });

  test('delete task successfully',async()=>{
     const mockedTask ={
        id:2,
        title:'Delete task',
        descriptiontsk:'Test for delete task',
        completed:false
     };

     taskRepo.findOne.mockResolvedValue(mockedTask);
     await taskService.deleteTask(2);
     expect(taskRepo.delete).toHaveBeenCalledWith(2);
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});