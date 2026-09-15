const pool = require("../db")


// ======================================================
// CREATE CATEGORY
// ======================================================

const createCategory = async (req, res) => {

  try {

    const { name } = req.body


    if (!name || !name.trim()) {

      return res.status(400).json({
        error: "Category name is required",
      })

    }


    const result = await pool.query(
      `
      INSERT INTO Categories (Name)

      VALUES ($1)

      RETURNING
        CategoryID,
        Name
      `,
      [name.trim()]
    )


    return res.status(201).json({

      message:
        "Category created successfully",

      category:
        result.rows[0],

    })


  } catch (error) {

    console.error(
      "Create category error:",
      error
    )


    if (error.code === "23505") {

      return res.status(409).json({
        error:
          "Category already exists",
      })

    }


    return res.status(500).json({
      error:
        "Failed to create category",
    })

  }

}


// ======================================================
// GET CATEGORIES
// ======================================================

const getCategories = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        c.CategoryID,
        c.Name,

        COUNT(a.AuctionID) AS AuctionCount

      FROM Categories c

      LEFT JOIN Auctions a
        ON c.CategoryID = a.CategoryID

      GROUP BY
        c.CategoryID,
        c.Name

      ORDER BY
        c.Name ASC
      `
    )


    return res.status(200).json(
      result.rows
    )


  } catch (error) {

    console.error(
      "Get categories error:",
      error
    )


    return res.status(500).json({
      error:
        "Failed to get categories",
    })

  }

}


// ======================================================
// UPDATE CATEGORY
// ======================================================

const updateCategory = async (req, res) => {

  try {

    const { id } = req.params

    const { name } = req.body


    if (!name || !name.trim()) {

      return res.status(400).json({
        error:
          "Category name is required",
      })

    }


    const result = await pool.query(
      `
      UPDATE Categories

      SET Name = $1

      WHERE CategoryID = $2

      RETURNING
        CategoryID,
        Name
      `,
      [
        name.trim(),
        id,
      ]
    )


    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        error:
          "Category not found",
      })

    }


    return res.status(200).json({

      message:
        "Category updated successfully",

      category:
        result.rows[0],

    })


  } catch (error) {

    console.error(
      "Update category error:",
      error
    )


    if (error.code === "23505") {

      return res.status(409).json({
        error:
          "Category already exists",
      })

    }


    return res.status(500).json({
      error:
        "Failed to update category",
    })

  }

}


// ======================================================
// DELETE CATEGORY
// ======================================================

const deleteCategory = async (req, res) => {

  try {

    const { id } = req.params


    const result = await pool.query(
      `
      DELETE FROM Categories

      WHERE CategoryID = $1

      RETURNING CategoryID
      `,
      [id]
    )


    if (
      result.rows.length === 0
    ) {

      return res.status(404).json({
        error:
          "Category not found",
      })

    }


    return res.status(200).json({
      message:
        "Category deleted successfully",
    })


  } catch (error) {

    console.error(
      "Delete category error:",
      error
    )


    // Category is being used by auctions
    if (error.code === "23503") {

      return res.status(409).json({
        error:
          "Category cannot be deleted because it is being used by auctions",
      })

    }


    return res.status(500).json({
      error:
        "Failed to delete category",
    })

  }

}


module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
}