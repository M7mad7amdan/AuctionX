const pool = require("../db")
const { finalizeAuction } = require("../services/auctionService")

const finalizeExpiredAuctions = async () => {
  try {
    const result = await pool.query(
      `
      SELECT AuctionID
      FROM Auctions
      WHERE EndTime <= NOW()
        AND Finalized = FALSE
        AND Cancelled = FALSE
      `
    )

    for (const auction of result.rows) {
      try {
        await finalizeAuction(auction.auctionid)

        console.log(
          `Auction ${auction.auctionid} finalized`
        )
      } catch (error) {
        console.error(
          `Failed to finalize auction ${auction.auctionid}:`,
          error
        )
      }
    }

  } catch (error) {
    console.error(
      "Auction finalizer error:",
      error
    )
  }
}


const startAuctionFinalizer = () => {

  // Run once when server starts
  finalizeExpiredAuctions()

  // Then check every 60 seconds
  setInterval(
    finalizeExpiredAuctions,
    60 * 1000
  )
}


module.exports = {
  startAuctionFinalizer,
}