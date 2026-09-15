const express = require("express")
const router = express.Router()

const authenticateToken =
  require("../middleware/authenticateToken")

const validate =
  require("../middleware/validate")

const {
  createAuctionSchema,
  auctionIdSchema,
  getAuctionsSchema,
} = require("../validation/auctionValidation")

const {
  createAuction,
  getAuctions,
  getAuctionById,
  cancelAuction,
} = require("../controllers/auctionController")


router.get(
  "/",
  validate(getAuctionsSchema),
  getAuctions
)

router.get(
  "/:id",
  validate(auctionIdSchema),
  getAuctionById
)

router.post(
  "/",
  authenticateToken,
  validate(createAuctionSchema),
  createAuction
)

router.patch(
  "/:id/cancel",
  authenticateToken,
  validate(auctionIdSchema),
  cancelAuction
)


module.exports = router