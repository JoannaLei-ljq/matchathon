import mongoose from 'mongoose';
import { z } from 'zod';

export const objectId = z
  .string()
  .refine((value) => mongoose.isValidObjectId(value), { message: 'Invalid id.' });

const tags = z.array(z.string().trim().min(1).max(40)).max(20);
const optionalText = (max) => z.string().trim().max(max);

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
  firstName: z.string().trim().min(1, 'Enter your first name.').max(50),
  lastName: optionalText(50).optional(),
  school: optionalText(100).optional(),
  location: optionalText(100).optional(),
  bio: optionalText(500).optional(),
  linkedin: z.union([z.string().trim().url().max(200), z.literal('')]).optional(),
  skills: tags.optional(),
  interests: tags.optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

// Everything on the profile except email and password can be edited.
export const updateProfileSchema = registerSchema
  .omit({ email: true, password: true })
  .partial()
  .strict();

export const hackathonQuerySchema = z.object({ hackathon: objectId });
