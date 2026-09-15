const { z } = require("zod")

const createProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(150, "Title is too long"),

    description: z
      .string()
      .trim()
      .max(3000, "Description is too long")
      .optional(),

    condition: z.enum(
      ["new", "used"],
      {
        error: "Condition must be new or used",
      }
    ),
  }),

  params: z.object({}),
  query: z.object({}),
})


const updateProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(150)
      .optional(),

    description: z
      .string()
      .trim()
      .max(3000)
      .optional(),

    condition: z
      .enum(["new", "used"])
      .optional(),
  }),

  params: z.object({
    id: z.coerce.number().int().positive(),
  }),

  query: z.object({}),
})


module.exports = {
  createProductSchema,
  updateProductSchema,
}