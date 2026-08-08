import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores allowed'),
  email: z.string().email(),
  mobile: z.string().optional(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
});

export const investmentSchema = z.object({
  amount: z.number().int().min(5).max(1000),
});

export const p2pTransferSchema = z.object({
  recipient: z.string(),
  amount: z.number().positive(),
  pin: z.string().length(6).regex(/^\d+$/, 'PIN must be exactly 6 digits'),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive(),
  method: z.string(),
});

export const depositSchema = z.object({
  amount: z.number().positive(),
  method: z.string(),
});
