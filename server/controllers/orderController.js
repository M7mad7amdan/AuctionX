const pool = require("../db")


const createOrder = async (req, res) => {
  const client =
    await pool.connect()

  try {
    const userId =
      req.user.userId

    const {
      auctionId,
      fullName,
      phone,
      address,
      apartment,
      city,
      state,
      postalCode,
      country,
    } = req.body


    await client.query("BEGIN")


    // ====================================================
    // GET + LOCK AUCTION
    // ====================================================

    const auctionResult =
      await client.query(
        `
        SELECT
          AuctionID,
          SellerID,
          WinnerUserID,
          StartPrice,
          EndTime,
          Cancelled,
          Finalized

        FROM Auctions

        WHERE AuctionID = $1

        FOR UPDATE
        `,
        [auctionId]
      )


    if (
      auctionResult.rows.length === 0
    ) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(404).json({
        error: "Auction not found",
      })
    }


    const auction =
      auctionResult.rows[0]


    // ====================================================
    // CANCELLED AUCTION
    // ====================================================

    if (auction.cancelled) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(400).json({
        error:
          "Cancelled auctions cannot be checked out",
      })
    }


    // ====================================================
    // AUCTION MUST BE FINISHED
    // ====================================================

    if (!auction.finalized) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(400).json({
        error:
          "Auction has not been finalized yet",
      })
    }


    // ====================================================
    // MUST HAVE WINNER
    // ====================================================

    if (!auction.winneruserid) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(400).json({
        error:
          "This auction has no winner",
      })
    }


    // ====================================================
    // ONLY WINNER CAN CHECKOUT
    // ====================================================

    if (
      Number(
        auction.winneruserid
      ) !== Number(userId)
    ) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(403).json({
        error:
          "Only the auction winner can create this order",
      })
    }


    // ====================================================
    // CHECK EXISTING ORDER
    // ====================================================

    const existingOrder =
      await client.query(
        `
        SELECT
          OrderID

        FROM Orders

        WHERE AuctionID = $1
        `,
        [auctionId]
      )


    if (
      existingOrder.rows.length > 0
    ) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(409).json({
        error:
          "An order already exists for this auction",
        orderId:
          existingOrder.rows[0]
            .orderid,
      })
    }


    // ====================================================
    // GET REAL WINNING BID FROM DATABASE
    // ====================================================

    const winningBidResult =
      await client.query(
        `
        SELECT
          BidID,
          UserID,
          Amount

        FROM Bids

        WHERE AuctionID = $1

        ORDER BY
          Amount DESC,
          BidID DESC

        LIMIT 1
        `,
        [auctionId]
      )


    if (
      winningBidResult.rows.length === 0
    ) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(400).json({
        error:
          "No winning bid was found",
      })
    }


    const winningBid =
      winningBidResult.rows[0]


    // Extra consistency check

    if (
      Number(
        winningBid.userid
      ) !==
      Number(
        auction.winneruserid
      )
    ) {
      await client.query(
        "ROLLBACK"
      )

      return res.status(409).json({
        error:
          "Auction winner does not match the highest bidder",
      })
    }


    // ====================================================
    // CREATE ORDER
    // ====================================================

    const result =
      await client.query(
        `
        INSERT INTO Orders (
          AuctionID,
          BuyerID,
          SellerID,
          WinningAmount,
          FullName,
          Phone,
          Address,
          Apartment,
          City,
          State,
          PostalCode,
          Country
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12
        )

        RETURNING
          OrderID,
          AuctionID,
          BuyerID,
          SellerID,
          WinningAmount,
          FullName,
          Phone,
          Address,
          Apartment,
          City,
          State,
          PostalCode,
          Country,
          Status,
          CreatedAt
        `,
        [
          auctionId,
          userId,
          auction.sellerid,
          winningBid.amount,
          fullName.trim(),
          phone.trim(),
          address.trim(),
          apartment?.trim() || null,
          city.trim(),
          state?.trim() || null,
          postalCode?.trim() || null,
          country.trim(),
        ]
      )


    await client.query(
      "COMMIT"
    )


    return res.status(201).json({
      message:
        "Order confirmed successfully",

      order:
        result.rows[0],
    })

  } catch (error) {
    try {
      await client.query(
        "ROLLBACK"
      )
    } catch (
      rollbackError
    ) {
      console.error(
        "Rollback error:",
        rollbackError
      )
    }


    // UNIQUE AuctionID fallback protection
    if (
      error.code === "23505"
    ) {
      return res.status(409).json({
        error:
          "An order already exists for this auction",
      })
    }


    console.error(
      "Create order error:",
      error
    )


    return res.status(500).json({
      error:
        "Failed to create order",
    })

  } finally {
    client.release()
  }
}


// ====================================================
// GET MY ORDERS
// ====================================================

const getMyOrders =
  async (req, res) => {
    try {
      const userId =
        req.user.userId


      const result =
        await pool.query(
          `
          SELECT
            o.OrderID,
            o.AuctionID,
            o.BuyerID,
            o.SellerID,
            o.WinningAmount,
            o.FullName,
            o.Phone,
            o.Address,
            o.Apartment,
            o.City,
            o.State,
            o.PostalCode,
            o.Country,
            o.Status,
            o.CreatedAt,

            p.Title,
            p.Condition,

            seller.Name
              AS SellerName,

            (
              SELECT pi.ImageURL

              FROM ProductImages pi

              WHERE
                pi.ProductID =
                a.ProductID

              ORDER BY
                pi.ImageID ASC

              LIMIT 1
            ) AS ImageURL

          FROM Orders o

          JOIN Auctions a
            ON
              o.AuctionID =
              a.AuctionID

          JOIN Products p
            ON
              a.ProductID =
              p.ProductID

          JOIN Users seller
            ON
              o.SellerID =
              seller.UserID

          WHERE
            o.BuyerID = $1

          ORDER BY
            o.CreatedAt DESC
          `,
          [userId]
        )


      return res.status(200).json({
        orders:
          result.rows,
      })

    } catch (error) {
      console.error(
        "Get my orders error:",
        error
      )


      return res.status(500).json({
        error:
          "Failed to get orders",
      })
    }
  }


// ====================================================
// GET ORDER
// ====================================================

const getOrderById =
  async (req, res) => {
    try {
      const userId =
        req.user.userId

      const {
        orderId,
      } = req.params


      const result =
        await pool.query(
          `
          SELECT
            o.*,

            p.Title,
            p.Description,
            p.Condition,

            seller.Name
              AS SellerName,

            buyer.Name
              AS BuyerName,

            (
              SELECT pi.ImageURL

              FROM ProductImages pi

              WHERE
                pi.ProductID =
                a.ProductID

              ORDER BY
                pi.ImageID ASC

              LIMIT 1
            ) AS ImageURL

          FROM Orders o

          JOIN Auctions a
            ON
              o.AuctionID =
              a.AuctionID

          JOIN Products p
            ON
              a.ProductID =
              p.ProductID

          JOIN Users seller
            ON
              o.SellerID =
              seller.UserID

          JOIN Users buyer
            ON
              o.BuyerID =
              buyer.UserID

          WHERE
            o.OrderID = $1

            AND (
              o.BuyerID = $2
              OR
              o.SellerID = $2
            )
          `,
          [
            orderId,
            userId,
          ]
        )


      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Order not found",
        })
      }


      return res.status(200).json(
        result.rows[0]
      )

    } catch (error) {
      console.error(
        "Get order error:",
        error
      )


      return res.status(500).json({
        error:
          "Failed to get order",
      })
    }
  }


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
}