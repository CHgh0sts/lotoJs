import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '1830', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handle);
    const io = new Server(httpServer);

    io.on('connection', (socket) => {
        console.log(`Un utilisateur est connecté ${socket.id}`);





        socket.on('joinGame', ({ gameId , user }) => {
            socket.join(gameId);
            socket.gameId = gameId;
            socket.to(gameId).emit('userJoined', user);
        })

        socket.on('updateNumber', ({ gameId, data }) => {

            socket.join(gameId);
            socket.to(gameId).emit('numbersUpdated', data);
        })

        socket.on('updateTypeParty', ({ gameId, partyId, typePartyId }) => {
            socket.join(gameId);
            console.log('updateTypeParty', partyId, typePartyId);
            socket.to(gameId).emit('typePartyUpdated', { partyId, typePartyId });
        })
        socket.on('newParty', ({ party, gameId }) => {
            socket.join(gameId);
            socket.to(gameId).emit('newPartyCreated', { party });
        })
        socket.on('updateListUsers', ({ gameId, listUsers }) => {
            socket.join(gameId);
            socket.to(gameId).emit('listUsersUpdated', { listUsers: listUsers });
        })
        socket.on('updateCartons', ({ gameId, listCartons }) => {
            socket.join(gameId);
            socket.to(gameId).emit('listCartonsUpdated', { listCartons: listCartons });
        })




        socket.on('disconnect', () => {
            console.log(`Un utilisateur est déconnecté ${socket.id}`);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});