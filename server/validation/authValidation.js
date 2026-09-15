const { z } = require("zod")


const allowedEmailDomains = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
]


const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .refine(
    (email) => {
      const domain =
        email.split("@")[1]

      return allowedEmailDomains.includes(
        domain
      )
    },
    {
      message:
        "Please use a valid email provider such as Gmail, Hotmail, Outlook, Yahoo, or iCloud",
    }
  )


const registerSchema = z.object({

  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .regex(
      /^[A-Za-z ]+$/,
      "Name must contain English letters and spaces only"
    ),

  email: emailSchema,

  password: z
    .string()
    .min(
      8,
      "Password must be at least 8 characters"
    ),

})


const loginSchema = z.object({

  email: emailSchema,

  password: z
    .string()
    .min(
      1,
      "Password is required"
    ),

})


module.exports = {
  registerSchema,
  loginSchema,
}