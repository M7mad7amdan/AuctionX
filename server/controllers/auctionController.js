const pool = require("../db")
const { getIO } = require("../socket")


// ======================================================
// CREATE AUCTION
// ======================================================

const createAuction = async (req, res) => {

  try {

    const sellerId = req.user.userId

    const {
      productId,
      categoryId,
      startPrice,
      minIncrease,
      startTime,
      endTime,
    } = req.body


    if (
      !productId ||
      !categoryId ||
      !startPrice ||
      !minIncrease ||
      !startTime ||
      !endTime
    ) {

      return res.status(400).json({
        error: "All auction fields are required",
      })

    }


    if (Number(startPrice) <= 0) {

      return res.status(400).json({
        error: "Start price must be greater than 0",
      })

    }


    if (Number(minIncrease) <= 0) {

      return res.status(400).json({
        error: "Minimum increase must be greater than 0",
      })

    }


    const start = new Date(startTime)
    const end = new Date(endTime)


    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {

      return res.status(400).json({
        error: "Invalid start time or end time",
      })

    }


    if (end <= start) {

      return res.status(400).json({
        error: "End time must be after start time",
      })

    }


    // ==================================================
    // CHECK PRODUCT
    // ==================================================

    const productResult = await pool.query(
      `
      SELECT
        ProductID,
        OwnerID

      FROM Products

      WHERE ProductID = $1
      `,
      [productId]
    )


    if (productResult.rows.length === 0) {

      return res.status(404).json({
        error: "Product not found",
      })

    }


    const product = productResult.rows[0]


    if (
      Number(product.ownerid) !==
      Number(sellerId)
    ) {

      return res.status(403).json({
        error:
          "You can only create an auction for your own product",
      })

    }


    // ==================================================
    // CHECK CATEGORY
    // ==================================================

    const categoryResult = await pool.query(
      `
      SELECT
        CategoryID

      FROM Categories

      WHERE CategoryID = $1
      `,
      [categoryId]
    )


    if (categoryResult.rows.length === 0) {

      return res.status(404).json({
        error: "Category not found",
      })

    }


    // ==================================================
    // CREATE AUCTION
    // ==================================================

    const result = await pool.query(
      `
      INSERT INTO Auctions
      (
        ProductID,
        SellerID,
        CategoryID,
        StartPrice,
        MinIncrease,
        StartTime,
        EndTime
      )

      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )

      RETURNING
        AuctionID,
        ProductID,
        SellerID,
        CategoryID,
        StartPrice,
        MinIncrease,
        StartTime,
        EndTime,
        WinnerUserID,
        Cancelled,
        Finalized,
        CreatedAt
      `,
      [
        productId,
        sellerId,
        categoryId,
        startPrice,
        minIncrease,
        startTime,
        endTime,
      ]
    )


    return res.status(201).json({
      message: "Auction created successfully",
      auction: result.rows[0],
    })


  } catch (error) {

    console.error(
      "Create auction error:",
      error
    )


    return res.status(500).json({
      error: "Failed to create auction",
    })

  }

}


// ======================================================
// GET AUCTIONS
// ======================================================

const getAuctions = async (req, res) => {

  try {

    const {
      search,
      categoryId,

      // NEW: used by My Listings
      sellerId,

      status,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query


    // ==================================================
    // PAGINATION
    // ==================================================

    const parsedPage = Number(page)
    const parsedLimit = Number(limit)


    if (
      !Number.isInteger(parsedPage) ||
      parsedPage < 1
    ) {

      return res.status(400).json({
        error: "Invalid page",
      })

    }


    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 100
    ) {

      return res.status(400).json({
        error: "Invalid limit",
      })

    }


    const offset =
      (parsedPage - 1) * parsedLimit


    // ==================================================
    // FILTERS
    // ==================================================

    const values = []
    const conditions = []


    // ==================================================
    // SEARCH
    // ==================================================

    if (search) {

      values.push(`%${search}%`)


      conditions.push(`
        (
          p.Title ILIKE $${values.length}
          OR
          p.Description ILIKE $${values.length}
        )
      `)

    }


    // ==================================================
    // CATEGORY
    // ==================================================

    if (categoryId) {

      const parsedCategoryId =
        Number(categoryId)


      if (
        !Number.isInteger(parsedCategoryId) ||
        parsedCategoryId <= 0
      ) {

        return res.status(400).json({
          error: "Invalid category ID",
        })

      }


      values.push(parsedCategoryId)


      conditions.push(`
        a.CategoryID = $${values.length}
      `)

    }


    // ==================================================
    // SELLER
    // Used by:
    // GET /auctions?sellerId=5
    // ==================================================

    if (sellerId) {

      const parsedSellerId =
        Number(sellerId)


      if (
        !Number.isInteger(parsedSellerId) ||
        parsedSellerId <= 0
      ) {

        return res.status(400).json({
          error: "Invalid seller ID",
        })

      }


      values.push(parsedSellerId)


      conditions.push(`
        a.SellerID = $${values.length}
      `)

    }


    // ==================================================
    // STATUS
    // ==================================================

    const allowedStatuses = [
      "upcoming",
      "live",
      "ended",
      "cancelled",
    ]


    if (status) {

      if (
        !allowedStatuses.includes(status)
      ) {

        return res.status(400).json({
          error: "Invalid auction status",
        })

      }


      if (status === "upcoming") {

        conditions.push(`
          a.Cancelled = FALSE
          AND
          a.StartTime > NOW()
        `)

      }


      if (status === "live") {

        conditions.push(`
          a.Cancelled = FALSE
          AND
          a.StartTime <= NOW()
          AND
          a.EndTime > NOW()
        `)

      }


      if (status === "ended") {

        conditions.push(`
          a.Cancelled = FALSE
          AND
          a.EndTime <= NOW()
        `)

      }


      if (status === "cancelled") {

        conditions.push(`
          a.Cancelled = TRUE
        `)

      }

    }


    // ==================================================
    // MIN PRICE
    // ==================================================

    if (minPrice !== undefined) {

      const parsedMinPrice =
        Number(minPrice)


      if (
        !Number.isFinite(parsedMinPrice) ||
        parsedMinPrice < 0
      ) {

        return res.status(400).json({
          error: "Invalid minimum price",
        })

      }


      values.push(parsedMinPrice)


      conditions.push(`
        COALESCE(
          (
            SELECT MAX(b.Amount)

            FROM Bids b

            WHERE
              b.AuctionID =
              a.AuctionID
          ),
          a.StartPrice
        ) >= $${values.length}
      `)

    }


    // ==================================================
    // MAX PRICE
    // ==================================================

    if (maxPrice !== undefined) {

      const parsedMaxPrice =
        Number(maxPrice)


      if (
        !Number.isFinite(parsedMaxPrice) ||
        parsedMaxPrice < 0
      ) {

        return res.status(400).json({
          error: "Invalid maximum price",
        })

      }


      values.push(parsedMaxPrice)


      conditions.push(`
        COALESCE(
          (
            SELECT MAX(b.Amount)

            FROM Bids b

            WHERE
              b.AuctionID =
              a.AuctionID
          ),
          a.StartPrice
        ) <= $${values.length}
      `)

    }


    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number(maxPrice) < Number(minPrice)
    ) {

      return res.status(400).json({
        error:
          "Maximum price must be greater than or equal to minimum price",
      })

    }


    // ==================================================
    // SORT
    // ==================================================

    const allowedSorts = [
      "price-low",
      "price-high",
    ]


    if (
      sort &&
      !allowedSorts.includes(sort)
    ) {

      return res.status(400).json({
        error: "Invalid sort option",
      })

    }


    let orderByClause = `
      ORDER BY
        a.CreatedAt DESC,
        a.AuctionID DESC
    `


    if (sort === "price-low") {

      orderByClause = `
        ORDER BY
          CurrentPrice ASC,
          a.AuctionID DESC
      `

    }


    if (sort === "price-high") {

      orderByClause = `
        ORDER BY
          CurrentPrice DESC,
          a.AuctionID DESC
      `

    }


    // ==================================================
    // WHERE
    // ==================================================

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : ""


    // ==================================================
    // COUNT
    // ==================================================

    const countResult =
      await pool.query(
        `
        SELECT
          COUNT(*) AS Total

        FROM Auctions a

        JOIN Products p
          ON a.ProductID =
             p.ProductID

        JOIN Users u
          ON a.SellerID =
             u.UserID

        JOIN Categories c
          ON a.CategoryID =
             c.CategoryID

        ${whereClause}
        `,
        values
      )


    const totalAuctions =
      Number(
        countResult.rows[0].total
      )


    const totalPages =
      Math.ceil(
        totalAuctions /
        parsedLimit
      )


    // ==================================================
    // PAGINATION VALUES
    // ==================================================

    const auctionValues = [
      ...values,
      parsedLimit,
      offset,
    ]


    const limitPosition =
      values.length + 1


    const offsetPosition =
      values.length + 2


    // ==================================================
    // GET AUCTIONS
    // ==================================================

    const result =
      await pool.query(
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
          a.CreatedAt,

          p.Title,
          p.Description,
          p.Condition,

          u.Name AS SellerName,

          c.Name AS CategoryName,


          -- FIRST PRODUCT IMAGE

          (
            SELECT
              pi.ImageURL

            FROM ProductImages pi

            WHERE
              pi.ProductID =
              p.ProductID

            ORDER BY
              pi.CreatedAt ASC,
              pi.ImageID ASC

            LIMIT 1
          ) AS ImageURL,


          -- CURRENT PRICE

          COALESCE(
            (
              SELECT
                MAX(b.Amount)

              FROM Bids b

              WHERE
                b.AuctionID =
                a.AuctionID
            ),
            a.StartPrice
          ) AS CurrentPrice,


          -- BID COUNT

          (
            SELECT
              COUNT(*)

            FROM Bids b

            WHERE
              b.AuctionID =
              a.AuctionID
          ) AS BidCount,


          -- STATUS

          CASE

            WHEN
              a.Cancelled = TRUE
              THEN 'cancelled'

            WHEN
              a.StartTime > NOW()
              THEN 'upcoming'

            WHEN
              a.StartTime <= NOW()
              AND
              a.EndTime > NOW()
              THEN 'live'

            ELSE 'ended'

          END AS Status


        FROM Auctions a


        JOIN Products p
          ON a.ProductID =
             p.ProductID


        JOIN Users u
          ON a.SellerID =
             u.UserID


        JOIN Categories c
          ON a.CategoryID =
             c.CategoryID


        ${whereClause}


        ${orderByClause}


        LIMIT $${limitPosition}

        OFFSET $${offsetPosition}
        `,
        auctionValues
      )


    return res.status(200).json({

      auctions: result.rows,

      pagination: {

        page: parsedPage,

        limit: parsedLimit,

        totalAuctions,

        totalPages,

      },

    })


  } catch (error) {

    console.error(
      "Get auctions error:",
      error
    )


    return res.status(500).json({
      error: "Failed to get auctions",
    })

  }

}


// ======================================================
// GET AUCTION BY ID
// ======================================================

const getAuctionById = async (
  req,
  res
) => {

  try {

    const { id } = req.params


    const result =
      await pool.query(
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
          a.CreatedAt,

          p.Title,
          p.Description,
          p.Condition,

          u.Name AS SellerName,
          u.Image AS SellerImage,

          c.Name AS CategoryName,


          COALESCE(
            (
              SELECT
                MAX(b.Amount)

              FROM Bids b

              WHERE
                b.AuctionID =
                a.AuctionID
            ),
            a.StartPrice
          ) AS CurrentPrice,


          (
            SELECT
              COUNT(*)

            FROM Bids b

            WHERE
              b.AuctionID =
              a.AuctionID
          ) AS BidCount,


          (
            SELECT
              b.UserID

            FROM Bids b

            WHERE
              b.AuctionID =
              a.AuctionID

            ORDER BY
              b.Amount DESC,
              b.BidID DESC

            LIMIT 1
          ) AS HighestBidderId,


          CASE

            WHEN
              a.Cancelled = TRUE
              THEN 'cancelled'

            WHEN
              a.StartTime > NOW()
              THEN 'upcoming'

            WHEN
              a.StartTime <= NOW()
              AND
              a.EndTime > NOW()
              THEN 'live'

            ELSE 'ended'

          END AS Status


        FROM Auctions a


        JOIN Products p
          ON a.ProductID =
             p.ProductID


        JOIN Users u
          ON a.SellerID =
             u.UserID


        JOIN Categories c
          ON a.CategoryID =
             c.CategoryID


        WHERE
          a.AuctionID = $1
        `,
        [id]
      )


    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        error: "Auction not found",
      })

    }


    const auction =
      result.rows[0]


    // ==================================================
    // IMAGES
    // ==================================================

    const imagesResult =
      await pool.query(
        `
        SELECT
          ImageID,
          ImageURL,
          StoragePath

        FROM ProductImages

        WHERE
          ProductID = $1

        ORDER BY
          CreatedAt ASC,
          ImageID ASC
        `,
        [auction.productid]
      )


    // ==================================================
    // RECENT BIDS
    // ==================================================

    const bidsResult =
      await pool.query(
        `
        SELECT
          b.BidID,
          b.UserID,
          b.Amount,
          b.CreatedAt,

          u.Name AS BidderName

        FROM Bids b

        JOIN Users u
          ON b.UserID =
             u.UserID

        WHERE
          b.AuctionID = $1

        ORDER BY
          b.Amount DESC,
          b.CreatedAt DESC

        LIMIT 10
        `,
        [id]
      )


    return res.status(200).json({

      ...auction,

      images:
        imagesResult.rows,

      recentBids:
        bidsResult.rows,

    })


  } catch (error) {

    console.error(
      "Get auction error:",
      error
    )


    return res.status(500).json({
      error: "Failed to get auction",
    })

  }

}


// ======================================================
// CANCEL AUCTION
// ======================================================

const cancelAuction = async (
  req,
  res
) => {

  let client


  try {

    client =
      await pool.connect()


    const userId =
      req.user.userId


    const { id } =
      req.params


    await client.query("BEGIN")


    // ==================================================
    // LOCK AUCTION
    // ==================================================

    const auctionResult =
      await client.query(
        `
        SELECT
          AuctionID,
          SellerID,
          Cancelled,
          EndTime

        FROM Auctions

        WHERE
          AuctionID = $1

        FOR UPDATE
        `,
        [id]
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


    const isSeller =
      Number(
        auction.sellerid
      ) === Number(userId)


    const isAdmin =
      req.user.role === "admin"


    // ==================================================
    // AUTHORIZATION
    // ==================================================

    if (
      !isSeller &&
      !isAdmin
    ) {

      await client.query(
        "ROLLBACK"
      )


      return res.status(403).json({
        error:
          "You are not allowed to cancel this auction",
      })

    }


    if (auction.cancelled) {

      await client.query(
        "ROLLBACK"
      )


      return res.status(400).json({
        error:
          "Auction is already cancelled",
      })

    }


    if (
      new Date(
        auction.endtime
      ) <= new Date()
    ) {

      await client.query(
        "ROLLBACK"
      )


      return res.status(400).json({
        error:
          "Ended auctions cannot be cancelled",
      })

    }


    // ==================================================
    // CHECK BIDS
    // ==================================================

    const bidsResult =
      await client.query(
        `
        SELECT
          COUNT(*) AS BidCount

        FROM Bids

        WHERE
          AuctionID = $1
        `,
        [id]
      )


    const bidCount =
      Number(
        bidsResult
          .rows[0]
          .bidcount
      )


    if (
      bidCount > 0 &&
      !isAdmin
    ) {

      await client.query(
        "ROLLBACK"
      )


      return res.status(400).json({
        error:
          "Auction cannot be cancelled after bids have been placed",
      })

    }


    // ==================================================
    // CANCEL
    // ==================================================

    const result =
      await client.query(
        `
        UPDATE Auctions

        SET
          Cancelled = TRUE

        WHERE
          AuctionID = $1

        RETURNING
          AuctionID,
          ProductID,
          SellerID,
          CategoryID,
          StartPrice,
          MinIncrease,
          StartTime,
          EndTime,
          WinnerUserID,
          Cancelled,
          Finalized,
          CreatedAt
        `,
        [id]
      )


    await client.query(
      "COMMIT"
    )


    const cancelledAuction =
      result.rows[0]


    // ==================================================
    // SOCKET
    // ==================================================

    try {

      const io =
        getIO()


      io
        .to(`auction:${id}`)
        .emit(
          "auctionCancelled",
          {
            auctionId:
              Number(id),
          }
        )


    } catch (socketError) {

      console.error(
        "Auction cancelled but Socket.IO emit failed:",
        socketError
      )

    }


    return res.status(200).json({

      message:
        "Auction cancelled successfully",

      auction:
        cancelledAuction,

    })


  } catch (error) {

    if (client) {

      try {

        await client.query(
          "ROLLBACK"
        )

      } catch (rollbackError) {

        console.error(
          "Rollback error:",
          rollbackError
        )

      }

    }


    console.error(
      "Cancel auction error:",
      error
    )


    return res.status(500).json({
      error:
        "Failed to cancel auction",
    })


  } finally {

    if (client) {
      client.release()
    }

  }

}


module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  cancelAuction,
}