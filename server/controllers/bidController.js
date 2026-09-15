const pool = require("../db")
const { getIO } = require("../socket")


// ====================================================
// CREATE BID
// ====================================================

const createBid = async (req, res) => {
  const client = await pool.connect()

  try {
    const userId = req.user.userId
    const { auctionId } = req.params
    const { amount } = req.body

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        error: "Bid amount is required",
      })
    }

    const bidAmount = Number(amount)

    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({
        error: "Bid amount must be a valid positive number",
      })
    }

    await client.query("BEGIN")

    const auctionResult = await client.query(
      `
      SELECT
        AuctionID,
        SellerID,
        StartPrice,
        MinIncrease,
        StartTime,
        EndTime,
        Cancelled,
        NOW() >= StartTime AS HasStarted,
        NOW() < EndTime AS HasNotEnded

      FROM Auctions

      WHERE AuctionID = $1

      FOR UPDATE
      `,
      [auctionId]
    )

    if (auctionResult.rows.length === 0) {
      await client.query("ROLLBACK")

      return res.status(404).json({
        error: "Auction not found",
      })
    }

    const auction = auctionResult.rows[0]

    if (auction.cancelled) {
      await client.query("ROLLBACK")

      return res.status(400).json({
        error: "Auction has been cancelled",
      })
    }

    if (!auction.hasstarted) {
      await client.query("ROLLBACK")

      return res.status(400).json({
        error: "Auction has not started yet",
      })
    }

    if (!auction.hasnotended) {
      await client.query("ROLLBACK")

      return res.status(400).json({
        error: "Auction has already ended",
      })
    }

    if (Number(auction.sellerid) === Number(userId)) {
      await client.query("ROLLBACK")

      return res.status(403).json({
        error: "You cannot bid on your own auction",
      })
    }

    const highestBidResult = await client.query(
      `
      SELECT
        BidID,
        UserID,
        Amount,
        CreatedAt

      FROM Bids

      WHERE AuctionID = $1

      ORDER BY Amount DESC, BidID DESC

      LIMIT 1
      `,
      [auctionId]
    )

    let minimumAllowed

    if (highestBidResult.rows.length === 0) {
      minimumAllowed = Number(auction.startprice)
    } else {
      const highestBid = highestBidResult.rows[0]

      minimumAllowed =
        Number(highestBid.amount) +
        Number(auction.minincrease)
    }

    if (bidAmount < minimumAllowed) {
      await client.query("ROLLBACK")

      return res.status(400).json({
        error: `Minimum allowed bid is ${minimumAllowed}`,
      })
    }

    const bidResult = await client.query(
      `
      INSERT INTO Bids
      (
        AuctionID,
        UserID,
        Amount
      )

      VALUES ($1, $2, $3)

      RETURNING
        BidID,
        AuctionID,
        UserID,
        Amount,
        CreatedAt
      `,
      [
        auctionId,
        userId,
        bidAmount,
      ]
    )

    await client.query("COMMIT")

    const newBid = bidResult.rows[0]

    // Socket event happens after successful DB commit
    try {
      const io = getIO()

      io.to(`auction:${auctionId}`).emit("newBid", {
        auctionId: Number(auctionId),
        bid: newBid,
        currentPrice: bidAmount,
      })
    } catch (socketError) {
      console.error(
        "New bid socket error:",
        socketError
      )
    }

    return res.status(201).json({
      message: "Bid placed successfully",
      bid: newBid,
      currentPrice: bidAmount,
    })

  } catch (error) {
    try {
      await client.query("ROLLBACK")
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      )
    }

    console.error(
      "Create bid error:",
      error
    )

    return res.status(500).json({
      error: "Failed to place bid",
    })

  } finally {
    client.release()
  }
}


// ====================================================
// GET ALL BIDS FOR ONE AUCTION
// ====================================================

const getAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params

    const auctionResult = await pool.query(
      `
      SELECT AuctionID
      FROM Auctions
      WHERE AuctionID = $1
      `,
      [auctionId]
    )

    if (auctionResult.rows.length === 0) {
      return res.status(404).json({
        error: "Auction not found",
      })
    }

    const result = await pool.query(
      `
      SELECT
        b.BidID,
        b.AuctionID,
        b.UserID,
        b.Amount,
        b.CreatedAt,
        u.Name AS BidderName

      FROM Bids b

      JOIN Users u
        ON b.UserID = u.UserID

      WHERE b.AuctionID = $1

      ORDER BY b.Amount DESC, b.CreatedAt DESC
      `,
      [auctionId]
    )

    return res.status(200).json(
      result.rows
    )

  } catch (error) {
    console.error(
      "Get bids error:",
      error
    )

    return res.status(500).json({
      error: "Failed to get bids",
    })
  }
}


// ====================================================
// GET CURRENT USER BIDS
// ====================================================

const getMyBids = async (req, res) => {
  try {
    const userId = req.user.userId

    const result = await pool.query(
      `
      SELECT
        a.AuctionID,
        a.ProductID,
        a.SellerID,
        a.CategoryID,
        a.StartPrice,
        a.MinIncrease,
        a.StartTime,
        a.EndTime,
        a.WinnerUserID,
        a.Cancelled,
        a.Finalized,

        p.Title,
        p.Description,
        p.Condition,

        c.Name AS CategoryName,

        (
          SELECT pi.ImageURL
          FROM ProductImages pi
          WHERE pi.ProductID = p.ProductID
          ORDER BY pi.ImageID ASC
          LIMIT 1
        ) AS ImageURL,

        COALESCE(
          (
            SELECT MAX(b2.Amount)
            FROM Bids b2
            WHERE b2.AuctionID = a.AuctionID
          ),
          a.StartPrice
        ) AS CurrentPrice,

        (
          SELECT COUNT(*)
          FROM Bids b3
          WHERE b3.AuctionID = a.AuctionID
        ) AS BidCount,

        (
          SELECT MAX(b4.Amount)
          FROM Bids b4
          WHERE b4.AuctionID = a.AuctionID
            AND b4.UserID = $1
        ) AS MyHighestBid,

        CASE
          WHEN a.Cancelled = TRUE
            THEN 'cancelled'

          WHEN NOW() < a.StartTime
            THEN 'upcoming'

          WHEN NOW() >= a.EndTime
            THEN 'ended'

          ELSE 'live'
        END AS Status,

        CASE
          WHEN (
            SELECT b5.UserID
            FROM Bids b5
            WHERE b5.AuctionID = a.AuctionID
            ORDER BY b5.Amount DESC, b5.BidID DESC
            LIMIT 1
          ) = $1
          THEN TRUE

          ELSE FALSE
        END AS IsHighestBidder

      FROM Auctions a

      JOIN Products p
        ON p.ProductID = a.ProductID

      JOIN Categories c
        ON c.CategoryID = a.CategoryID

      WHERE EXISTS (
        SELECT 1

        FROM Bids myBid

        WHERE myBid.AuctionID = a.AuctionID
          AND myBid.UserID = $1
      )

      ORDER BY
        CASE
          WHEN a.Cancelled = FALSE
            AND NOW() >= a.StartTime
            AND NOW() < a.EndTime
          THEN 0

          ELSE 1
        END,

        a.EndTime ASC,
        a.AuctionID DESC
      `,
      [userId]
    )

    return res.status(200).json({
      bids: result.rows,
    })

  } catch (error) {
    console.error(
      "Get my bids error:",
      error
    )

    return res.status(500).json({
      error: "Failed to get your bids",
    })
  }
}


module.exports = {
  createBid,
  getAuctionBids,
  getMyBids,
}