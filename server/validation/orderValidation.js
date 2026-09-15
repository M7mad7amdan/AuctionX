const {
  z,
} = require("zod")


const createOrderSchema =
  z.object({
    body:
      z.object({
        auctionId:
          z.coerce
            .number()
            .int()
            .positive(
              "Invalid auction ID"
            ),

        fullName:
          z.string()
            .trim()
            .min(
              1,
              "Full name is required"
            )
            .max(
              150,
              "Full name is too long"
            ),

        phone:
          z.string()
            .trim()
            .min(
              1,
              "Phone number is required"
            )
            .max(
              50,
              "Phone number is too long"
            ),

        address:
          z.string()
            .trim()
            .min(
              1,
              "Address is required"
            )
            .max(
              250,
              "Address is too long"
            ),

        apartment:
          z.string()
            .trim()
            .max(
              150,
              "Apartment is too long"
            )
            .optional()
            .or(
              z.literal("")
            ),

        city:
          z.string()
            .trim()
            .min(
              1,
              "City is required"
            )
            .max(
              100,
              "City is too long"
            ),

        state:
          z.string()
            .trim()
            .max(
              100,
              "State is too long"
            )
            .optional()
            .or(
              z.literal("")
            ),

        postalCode:
          z.string()
            .trim()
            .max(
              30,
              "Postal code is too long"
            )
            .optional()
            .or(
              z.literal("")
            ),

        country:
          z.string()
            .trim()
            .min(
              1,
              "Country is required"
            )
            .max(
              100,
              "Country is too long"
            ),

        saveAddress:
          z.boolean()
            .optional(),
      }),

    params:
      z.object({}),

    query:
      z.object({}),
  })


const orderIdSchema =
  z.object({
    body:
      z.object({}),

    params:
      z.object({
        orderId:
          z.coerce
            .number()
            .int()
            .positive(
              "Invalid order ID"
            ),
      }),

    query:
      z.object({}),
  })


module.exports = {
  createOrderSchema,
  orderIdSchema,
}