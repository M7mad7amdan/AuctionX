const pool = require("../db")
const { getIO } = require("../socket")

const finalizeAuction = async (auctionId) => {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const auctionResult = await client.query(
      `
      SELECT
        AuctionID,
        EndTime,
        Cancelled,
        Finalized
      FROM Auctions
      WHERE AuctionID = $1
      FOR UPDATE
      `,
      [auctionId]
    )

    if (auctionResult.rows.length === 0) {
      await client.query("ROLLBACK")
      return null
    }

    const auction = auctionResult.rows[0]

    if (
      auction.cancelled ||
      auction.finalized ||
      new Date(auction.endtime) > new Date()
    ) {
      await client.query("ROLLBACK")
      return null
    }

    const highestBidResult = await client.query(
      `
      SELECT
        UserID,
        Amount
      FROM Bids
      WHERE AuctionID = $1
      ORDER BY Amount DESC, BidID ASC
      LIMIT 1
      `,
      [auctionId]
    )

    let winnerUserId = null

    if (highestBidResult.rows.length > 0) {
      winnerUserId = highestBidResult.rows[0].userid
    }

    const result = await client.query(
      `
      UPDATE Auctions
      SET
        WinnerUserID = $1,
        Finalized = TRUE
      WHERE AuctionID = $2

      RETURNING *
      `,
      [winnerUserId, auctionId]
    )

    await client.query("COMMIT")

    const finalizedAuction = result.rows[0]

    const io = getIO()

    io.to(`auction:${auctionId}`).emit("auctionEnded", {
      auctionId: Number(auctionId),
      winnerUserId: finalizedAuction.winneruserid,
    })

    return finalizedAuction

  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError)
    }

    throw error

  } finally {
    client.release()
  }
}

module.exports = {
  finalizeAuction,
}