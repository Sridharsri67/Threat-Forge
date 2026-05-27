let io;

exports.init = (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Analyst connected: ${socket.id}`);

        socket.on("join-room", (room) => {
            socket.join(room);
            console.log(`Socket joined room: ${room}`);
        });

        socket.on("disconnect", () => {
            console.log(`Analyst disconnected: ${socket.id}`);
        });
    });

    return io;
};

exports.getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Emit live IOC alert
exports.emitIOCAlert = (ioc) => {
    if (io) {
        io.emit("new-ioc-alert", ioc);
    }
};
