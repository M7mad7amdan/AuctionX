const pool = require("../db")


const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      bio,
      image,
    } = req.body

    const result = await pool.query(
      `
      INSERT INTO Users
      (Name, Email, Password, Bio, Image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        name,
        email,
        password,
        bio || null,
        image || null,
      ]
    )

    res.status(201).json(result.rows[0])

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to create user",
    })
  }
}


const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      SELECT *
      FROM Users
      WHERE UserID = $1
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    res.json(result.rows[0])

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to get user",
    })
  }
}


const updateUser = async (req, res) => {
  try {
    const { id } = req.params

    const {
      name,
      email,
      bio,
      image,
    } = req.body

    const result = await pool.query(
      `
      UPDATE Users
      SET
        Name = $1,
        Email = $2,
        Bio = $3,
        Image = $4
      WHERE UserID = $5
      RETURNING *
      `,
      [
        name,
        email,
        bio || null,
        image || null,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    res.json(result.rows[0])

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to update user",
    })
  }
}


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `
      DELETE FROM Users
      WHERE UserID = $1
      RETURNING *
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    res.json({
      message: "User deleted successfully",
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Failed to delete user",
    })
  }
}


module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
}