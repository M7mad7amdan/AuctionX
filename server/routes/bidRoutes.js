const express = require("express")

const router = express.Router()

const authenticateToken =
  require("../middleware/authenticateToken")

const validate =
  require("../middleware/validate")

const {
  createBidSchema,
  auctionBidsSchema,
} = require("../validation/bidValidation")

const {
  createBid,
  getAuctionBids,
  getMyBids,
} = require("../controllers/bidController")




router.get(
  "/me",
  authenticateToken,
  getMyBids
)



router.get(
  "/auction/:auctionId",
  validate(auctionBidsSchema),
  getAuctionBids
)


router.post(
  "/auction/:auctionId",
  authenticateToken,
  validate(createBidSchema),
  createBid
)


module.exports = router