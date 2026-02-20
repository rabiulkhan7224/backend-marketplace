import z from "zod";
import { ProjectStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../shared/prisma";
import { createProjectSchema } from "./project.schemas";


interface CreateProjectInput {
    title: string;
    description: string;
}

export const createProject = async (data: CreateProjectInput, buyerId: string) => {
  return prisma.project.create({
    data: {
      ...data,
      buyerId,
      status: ProjectStatus.OPEN,
    },
  });
};

export const getProjects = async () => {
  return prisma.project.findMany();
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { id },
  });
};