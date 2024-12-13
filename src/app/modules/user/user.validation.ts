import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Full name is required' }),
    email: z.string({ required_error: 'Enail name is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const updateUserZodSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().optional(),
  image: z.string().optional(),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
