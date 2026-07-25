const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Quando alguém acessar o seu link, o servidor envia o seu jogo (index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let players = {};

// Quando um novo jogador entra no jogo
io.on('connection', (socket) => {
    console.log('Novo jogador conectou: ' + socket.id);
    
    // Cria o jogador no mapa do servidor
    players[socket.id] = {
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        color: Math.random() > 0.5 ? '#ff5252' : '#448aff'
    };

    // Atualiza a posição quando o jogador mexe o mouse
    socket.on('move', (data) => {
        if(players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }
    });

    // Remove o jogador se ele fechar a aba
    socket.on('disconnect', () => {
        console.log('Jogador saiu: ' + socket.id);
        delete players[socket.id];
    });
});

// Envia a tela atualizada para todos os jogadores 30x por segundo
setInterval(() => {
    io.emit('state', players);
}, 1000 / 30);

const listener = http.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando na porta ' + listener.address().port);
});
