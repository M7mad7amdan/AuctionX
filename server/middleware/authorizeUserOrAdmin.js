const authorizeUserOrAdmin = (req, res, next) => {
  const requestedUserId = Number(req.params.id)
  const loggedInUserId = Number(req.user.userId)

  const isOwner = requestedUserId === loggedInUserId
  const isAdmin = req.user.role === "admin"

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      error: "You are not allowed to perform this action",
    })
  }

  next()
}

module.exports = authorizeUserOrAdmin