const pool = require("../db")


const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        UserID,
        Name,
        Email,
        Role,
        Bio,
        Image,
        AuthProvider,
        GoogleID,
        IsSuspended,
        CreatedAt
      FROM Users
      ORDER BY CreatedAt DESC
      `
    )

    return res.status(200).json(
      result.rows
    )

  } catch (error) {
    console.error(
      "Get users error:",
      error
    )

    return res.status(500).json({
      error: "Failed to get users",
    })
  }
}


const suspendUser = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user.userId

    if (Number(id) === Number(adminId)) {
      return res.status(400).json({
        error: "You cannot suspend your own account",
      })
    }

    const userResult = await pool.query(
      `
      SELECT
        UserID,
        Role,
        IsSuspended
      FROM Users
      WHERE UserID = $1
      `,
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    const user = userResult.rows[0]

    if (user.role === "admin") {
      return res.status(403).json({
        error: "You cannot suspend another admin",
      })
    }

    if (user.issuspended) {
      return res.status(400).json({
        error: "User is already suspended",
      })
    }

    const result = await pool.query(
      `
      UPDATE Users
      SET IsSuspended = TRUE
      WHERE UserID = $1

      RETURNING
        UserID,
        Name,
        Email,
        Role,
        IsSuspended,
        CreatedAt
      `,
      [id]
    )

    return res.status(200).json({
      message: "User suspended successfully",
      user: result.rows[0],
    })

  } catch (error) {
    console.error(
      "Suspend user error:",
      error
    )

    return res.status(500).json({
      error: "Failed to suspend user",
    })
  }
}


const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params

    const userResult = await pool.query(
      `
      SELECT
        UserID,
        IsSuspended
      FROM Users
      WHERE UserID = $1
      `,
      [id]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      })
    }

    const user = userResult.rows[0]

    if (!user.issuspended) {
      return res.status(400).json({
        error: "User is not suspended",
      })
    }

    const result = await pool.query(
      `
      UPDATE Users
      SET IsSuspended = FALSE
      WHERE UserID = $1

      RETURNING
        UserID,
        Name,
        Email,
        Role,
        IsSuspended,
        CreatedAt
      `,
      [id]
    )

    return res.status(200).json({
      message: "User unsuspended successfully",
      user: result.rows[0],
    })

  } catch (error) {
    console.error(
      "Unsuspend user error:",
      error
    )

    return res.status(500).json({
      error: "Failed to unsuspend user",
    })
  }
}


module.exports = {
  getUsers,
  suspendUser,
  unsuspendUser,
}