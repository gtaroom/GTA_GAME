import { z } from 'zod';
import { ApiError } from '../utils/api-error';

const couponSchema = z.object({
  code: z.string().optional(),
  amount: z.number().min(0),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  usageLimit: z.number().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine(data => {
  if (data.startDate >= data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date"
});

export const validateCouponInput = (data: unknown) => {
  try {
    return couponSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, error.errors[0].message);
    }
    throw error;
  }
}; 