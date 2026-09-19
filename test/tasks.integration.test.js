import app from "../app";
import request from "supertest";
import { prisma } from "../src/lib/prisma";

describe('GET /tasks',()=>{
   beforeEach(async()=>{
      await prisma.tasks.deleteMany();
      await prisma.tasks.createMany({
          data:[
            {title:'Test title',descriptiontsk:'description test'},
            {title:'Test integration 1',descriptiontsk:'a simple sentence'},
            {title:'Must do my homework',descriptiontsk:'My homework is practice English'},
            {title:'Watch videos of Programming',descriptiontsk:'Learn Python',completed:true},
            {title:'Search a new laptop',descriptiontsk:'Search laptop in a shop'}
          ]
      });
   });

   test('response 200 with pagination',async()=>{
     const response = await request(app).get('/api/tasks?page=1&limit=2');
     expect(response.status).toBe(200);
     expect(response.headers['content-type']).toMatch(/json/);
     expect(Array.isArray(response.body.data)).toBe(true);
     expect(response.body.data).toEqual(
        expect.arrayContaining([
            expect.objectContaining({title:'Watch videos of Programming',descriptiontsk:'Learn Python',completed:true}),
            expect.objectContaining({title:'Search a new laptop',descriptiontsk:'Search laptop in a shop',completed:false})
        ])
     );
     expect(response.body.pagination).toEqual(
       expect.objectContaining({page:1,totalPage:3,totalItems:5})
     );
     expect(response.body.pagination.totalItems).toBe(5);
   });

   test('response 200',async()=>{
     const response = await request(app).get('/api/tasks');
     expect(response.status).toBe(200);
     expect(response.headers['content-type']).toMatch(/json/);
     expect(Array.isArray(response.body.data)).toBe(true);
     expect(response.body.data).toEqual(
        expect.arrayContaining([
            expect.objectContaining({title:'Test title',descriptiontsk:'description test',completed:false}),
            expect.objectContaining({title:'Test integration 1',descriptiontsk:'a simple sentence',completed:false}),
            expect.objectContaining({title:'Must do my homework',descriptiontsk:'My homework is practice English',completed:false}),
            expect.objectContaining({title:'Watch videos of Programming',descriptiontsk:'Learn Python',completed:true}),
            expect.objectContaining({title:'Search a new laptop',descriptiontsk:'Search laptop in a shop',completed:false})
        ])
     );
     expect(response.body.pagination).toEqual(
       expect.objectContaining({page:1,totalPage:1,totalItems:5})
     );
     expect(response.body.pagination.totalItems).toBe(5);
   });

   test('response 200 with pagination and completed = true or false',async()=>{
     const response = await request(app).get('/api/tasks?page=1&limit=2&completed=true');
     expect(response.status).toBe(200);
     expect(response.headers['content-type']).toMatch(/json/);
     expect(Array.isArray(response.body.data)).toBe(true);
     expect(response.body.data).toEqual(
        expect.arrayContaining([
            expect.objectContaining({title:'Watch videos of Programming',descriptiontsk:'Learn Python',completed:true}),
        ])
     );
     expect(response.body.pagination).toEqual(
       expect.objectContaining({page:1,totalPage:1,totalItems:1})
     );
     expect(response.body.pagination.totalItems).toBe(1);
   });
});

describe('GET /tasks/:id',()=>{
    let taskId;
     beforeEach(async()=>{
      await prisma.tasks.deleteMany();
      taskId = await prisma.tasks.create({
          data:{title:'Test title',descriptiontsk:'description test',completed:false},
      });
   });
  
   test('response 200 and return the task',async()=>{
     const response = await request(app).get(`/api/tasks/${taskId.id}`);
     expect(response.status).toBe(200);
     expect(response.headers['content-type']).toMatch(/json/);
     expect(response.body.data).toEqual(
        expect.objectContaining({title:'Test title',descriptiontsk:'description test',completed:false})
     );
   });
});

describe('POST /tasks',()=>{
  beforeEach(async()=>{
    await prisma.tasks.deleteMany();
  });

  test('response 200 and created tasks',async()=>{
   const task = {
            title:'Buy games',
            descriptiontsk:'Search favorite games',
            completed:false
        };
    const response = await request(app).post('/api/tasks').send(task);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Task created successfully');

    const taskCreated = await prisma.tasks.findFirst({where:{title:'Buy games'}});
    expect(taskCreated).not.toBeNull();
    expect(taskCreated).toEqual(
        expect.objectContaining({title:'Buy games',descriptiontsk:'Search favorite games',completed:false})
    );
  });
});

describe('PATCH /tasks/:id',()=>{
    let task;
  beforeEach(async()=>{
    await prisma.tasks.deleteMany();
    task = await prisma.tasks.create({data:{title:'New title',descriptiontsk:'Title of the new book',completed:false}});
  });

  test('response 200 and update task',async()=>{
    const changes ={title:'Update title',descriptiontsk:'Update description',completed:true};

    const response = await request(app).patch(`/api/tasks/${task.id}`).send(changes);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task updated successfully');

    const updateTask = await prisma.tasks.findUnique({where:{id:task.id}});
    expect(updateTask).toEqual(
        expect.objectContaining({title:'Update title',descriptiontsk:'Update description',completed:true})
    );
  });
});

describe('DELETE /tasks/:id',()=>{
   let taskId;
     beforeEach(async()=>{
        await prisma.tasks.deleteMany();
      taskId = await prisma.tasks.create({
          data:{title:'Test title',descriptiontsk:'description test',completed:false},
      });
   });

   test('response 200 and task deleted',async()=>{
     const taskResponse = await request(app).delete(`/api/tasks/${taskId.id}`);
     expect(taskResponse.status).toBe(200);
     expect(taskResponse.body.message).toBe('Task deleted successfully');

     const taskDeleted = await prisma.tasks.findUnique({where:{id:taskId.id}});
     expect(taskDeleted).toBeNull();
   });
});

afterAll(async () => {
  await prisma.$disconnect();
});