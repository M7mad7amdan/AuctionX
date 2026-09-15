const { z } = require("zod")


const createBidSchema = z.object({
  body: z.object({
    amount: z.coerce
      .number()
      .positive("Bid amount must be greater than 0"),
  }),

  params: z.object({
    auctionId: z.coerce
      .number()
      .int()
      .positive("Invalid auction ID"),
  }),

  query: z.object({}),
})


const auctionBidsSchema = z.object({
  body: z.object({}),

  params: z.object({
    auctionId: z.coerce
      .number()
      .int()
      .positive("Invalid auction ID"),
  }),

  query: z.object({}),
})


module.exports = {
  createBidSchema,
  auctionBidsSchema,
}