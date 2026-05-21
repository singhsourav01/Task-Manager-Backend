import { z } from "zod";

export const CreateSchoolSchema = z.object({
  name: z
    .string()
    .min(1, "School name is required")
    .max(255, "School name must be less than 255 characters"),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const UpdateSchoolSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const SchoolQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateSchoolDTO = z.infer<typeof CreateSchoolSchema>;
export type UpdateSchoolDTO = z.infer<typeof UpdateSchoolSchema>;
export type SchoolQueryDTO = z.infer<typeof SchoolQuerySchema>;
