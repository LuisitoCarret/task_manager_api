import { prisma } from "../lib/prisma.js";

export const taskRepo = {
  findAll: (skipNum,takeNum,valueCompleted) => prisma.tasks.findMany({ where:{completed:valueCompleted}, omit: { id: true },take: takeNum, orderBy: {id:'desc'}, skip:skipNum }),
  total: (valueCompleted) => prisma.tasks.count({where:{completed:valueCompleted}}),
  findOne: (id) => prisma.tasks.findUnique({ where: { id }, omit: { id: true } }),
  create: (data) => prisma.tasks.create({ data }),
  update: (id, data) => prisma.tasks.update({ where: { id }, data }),
  delete: (id) => prisma.tasks.delete({ where: { id } }),
};
