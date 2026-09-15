const { z } = require("zod")


// ======================================================
// CREATE AUCTION
// ======================================================

const createAuctionSchema = z.object({

  body: z
    .object({

      productId: z.coerce
        .number()
        .int()
        .positive(
          "Invalid product ID"
        ),

      categoryId: z.coerce
        .number()
        .int()
        .positive(
          "Invalid category ID"
        ),

      startPrice: z.coerce
        .number()
        .positive(
          "Start price must be greater than 0"
        ),

      minIncrease: z.coerce
        .number()
        .positive(
          "Minimum increase must be greater than 0"
        ),

      startTime: z.coerce.date({
        error:
          "Invalid start time",
      }),

      endTime: z.coerce.date({
        error:
          "Invalid end time",
      }),

    })
    .refine(
      (data) =>
        data.endTime >
        data.startTime,
      {
        message:
          "End time must be after start time",

        path: [
          "endTime",
        ],
      }
    ),

  params: z.object({}),

  query: z.object({}),

})


// ======================================================
// AUCTION ID
// ======================================================

const auctionIdSchema = z.object({

  body: z.object({}),

  params: z.object({

    id: z.coerce
      .number()
      .int()
      .positive(
        "Invalid auction ID"
      ),

  }),

  query: z.object({}),

})


// ======================================================
// GET AUCTIONS
// ======================================================

const getAuctionsSchema = z.object({

  body: z.object({}),

  params: z.object({}),

  query: z
    .object({

      // ===============================================
      // SEARCH
      // ===============================================

      search: z
        .string()
        .trim()
        .optional(),


      // ===============================================
      // CATEGORY
      // ===============================================

      categoryId: z.coerce
        .number()
        .int()
        .positive(
          "Invalid category ID"
        )
        .optional(),


      // ===============================================
      // STATUS
      // ===============================================

      status: z
        .enum([
          "upcoming",
          "live",
          "ended",
          "cancelled",
        ])
        .optional(),


      // ===============================================
      // MIN PRICE
      // ===============================================

      minPrice: z.coerce
        .number()
        .min(
          0,
          "Minimum price cannot be negative"
        )
        .optional(),


      // ===============================================
      // MAX PRICE
      // ===============================================

      maxPrice: z.coerce
        .number()
        .min(
          0,
          "Maximum price cannot be negative"
        )
        .optional(),


      // ===============================================
      // SORT
      // ===============================================

      sort: z
        .enum([
          "price-low",
          "price-high",
        ])
        .optional(),


      // ===============================================
      // PAGE
      // ===============================================

      page: z.coerce
        .number()
        .int()
        .positive(
          "Invalid page"
        )
        .optional(),


      // ===============================================
      // LIMIT
      // ===============================================

      limit: z.coerce
        .number()
        .int()
        .min(
          1,
          "Limit must be at least 1"
        )
        .max(
          100,
          "Limit cannot be greater than 100"
        )
        .optional(),

    })

    // ===============================================
    // CHECK PRICE RANGE
    // ===============================================

    .refine(
      (data) => {

        if (
          data.minPrice !==
            undefined &&
          data.maxPrice !==
            undefined
        ) {

          return (
            data.maxPrice >=
            data.minPrice
          )

        }


        return true

      },
      {
        message:
          "Maximum price must be greater than or equal to minimum price",

        path: [
          "maxPrice",
        ],
      }
    ),

})


module.exports = {
  createAuctionSchema,
  auctionIdSchema,
  getAuctionsSchema,
}