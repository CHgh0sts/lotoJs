import { Server } from "socket.io";

export default function handler(req, res) {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server, {
            path: "/api/socketio",
            addTrailingSlash: false,
        });

        io.on("connection", (socket) => {
            console.log("Nouvelle connexion :", socket.id);

            socket.on("message", (data) => {
                console.log("Message reçu :", data);
                io.emit("message", data); // Broadcast à tous les clients
            });

            socket.on("disconnect", () => {
                console.log("Déconnexion :", socket.id);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
}
