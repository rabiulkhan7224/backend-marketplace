import z from "zod";
import { loginSchema, registerSchema } from "./schemas";
import bcrypt from 'bcrypt';
import { prisma } from "../../shared/prisma";
import AppError from "../../errors/error";
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import config from "../../config";


export const register = async (data: z.infer<typeof registerSchema>) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "SOLVER",
    },
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const login = async (data:{
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt_access_token_secret as Secret,
    { expiresIn: config.jwt_access_token_expires_in } as SignOptions
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};