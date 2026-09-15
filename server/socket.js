let io

const initSocket = (server) => {
  const { Server } = require("socket.io")

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("joinAuction", (auctionId) => {
      const roomName = `auction:${auctionId}`

      socket.join(roomName)

      console.log(
        `Socket ${socket.id} joined ${roomName}`
      )
    })

    socket.on("leaveAuction", (auctionId) => {
      const roomName = `auction:${auctionId}`

      socket.leave(roomName)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)
    })
  })

  return io
}


const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized")
  }

  return io
}


module.exports = {
  initSocket,
  getIO,
}