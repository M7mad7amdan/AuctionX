const pool = require("../db")


// ======================================================
// GET MY FAVORITES
// ======================================================

const getFavorites = async (req, res) => {

  try {

    const userId =
      req.user.userId


    const result =
      await pool.query(
        `
        SELECT
          f.FavoriteID,
          f.CreatedAt AS FavoritedAt,

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


          -- FIRST IMAGE

          (
            SELECT pi.ImageURL

            FROM ProductImages pi

            WHERE
              pi.ProductID = p.ProductID

            ORDER BY
              pi.CreatedAt ASC,
              pi.ImageID ASC

            LIMIT 1
          ) AS ImageURL,


          -- CURRENT PRICE

          COALESCE(
            (
              SELECT MAX(b.Amount)

              FROM Bids b

              WHERE
                b.AuctionID =
                a.AuctionID
            ),
            a.StartPrice
          ) AS CurrentPrice,


          -- BID COUNT

          (
            SELECT COUNT(*)

            FROM Bids b

            WHERE
              b.AuctionID =
              a.AuctionID
          ) AS BidCount,


          -- STATUS

          CASE

            WHEN a.Cancelled = TRUE
              THEN 'cancelled'

            WHEN a.StartTime > NOW()
              THEN 'upcoming'

            WHEN
              a.StartTime <= NOW()
              AND a.EndTime > NOW()
              THEN 'live'

            ELSE 'ended'

          END AS Status


        FROM Favorites f


        JOIN Auctions a
          ON f.AuctionID =
             a.AuctionID


        JOIN Products p
          ON a.ProductID =
             p.ProductID


        JOIN Categories c
          ON a.CategoryID =
             c.CategoryID


        WHERE
          f.UserID = $1


        ORDER BY
          f.CreatedAt DESC
        `,
        [userId]
      )


    return res.status(200).json(
      result.rows
    )


  } catch (error) {

    console.error(
      "Get favorites error:",
      error
    )


    return res.status(500).json({
      error:
        "Failed to get favorites",
    })

  }

}


// ======================================================
// ADD FAVORITE
// ======================================================

const addFavorite = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.userId


    const { auctionId } =
      req.params


    const parsedAuctionId =
      Number(auctionId)


    if (
      !Number.isInteger(
        parsedAuctionId
      ) ||
      parsedAuctionId <= 0
    ) {

      return res.status(400).json({
        error: "Invalid auction ID",
      })

    }


    // ==================================================
    // CHECK AUCTION EXISTS
    // ==================================================

    const auctionResult =
      await pool.query(
        `
        SELECT
          AuctionID

        FROM Auctions

        WHERE AuctionID = $1
        `,
        [parsedAuctionId]
      )


    if (
      auctionResult.rows.length === 0
    ) {

      return res.status(404).json({
        error: "Auction not found",
      })

    }


    // ==================================================
    // ADD FAVORITE
    // ==================================================

    const result =
      await pool.query(
        `
        INSERT INTO Favorites
        (
          UserID,
          AuctionID
        )

        VALUES ($1, $2)

        ON CONFLICT
          (UserID, AuctionID)

        DO NOTHING

        RETURNING
          FavoriteID,
          UserID,
          AuctionID,
          CreatedAt
        `,
        [
          userId,
          parsedAuctionId,
        ]
      )


    // Already favorite

    if (
      result.rows.length === 0
    ) {

      return res.status(200).json({
        message:
          "Auction is already in favorites",

        alreadyFavorite: true,
      })

    }


    return res.status(201).json({

      message:
        "Auction added to favorites",

      favorite:
        result.rows[0],

    })


  } catch (error) {

    console.error(
      "Add favorite error:",
      error
    )


    return res.status(500).json({
      error:
        "Failed to add favorite",
    })

  }

}


// ======================================================
// REMOVE FAVORITE
// ======================================================

const removeFavorite = async (
  req,
  res
) => {

  try {

    const userId =
      req.user.userId


    const { auctionId } =
      req.params


    const parsedAuctionId =
      Number(auctionId)


    if (
      !Number.isInteger(
        parsedAuctionId
      ) ||
      parsedAuctionId <= 0
    ) {

      return res.status(400).json({
        error: "Invalid auction ID",
      })

    }


    const result =
      await pool.query(
        `
        DELETE FROM Favorites

        WHERE
          UserID = $1
          AND AuctionID = $2

        RETURNING
          FavoriteID
        `,
        [
          userId,
          parsedAuctionId,
        ]
      )


    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        error:
          "Auction is not in favorites",
      })

    }


    return res.status(200).json({
      message:
        "Auction removed from favorites",
    })


  } catch (error) {

    console.error(
      "Remove favorite error:",
      error
    )


    return res.status(500).json({
      error:
        "Failed to remove favorite",
    })

  }

}


module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
}