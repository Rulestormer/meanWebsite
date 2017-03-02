// NPM Modules
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/database');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const express = require('express');

const app = express();
const server = app.listen(3000);
const io = require('socket.io').listen(server);

// Constants
const users = require('./routes/users');

// Module configuration
mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database);
});

mongoose.connection.on('error', (err) => {
  console.log('Database error' + err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/users', users);

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
function getZeit(){
  return '[' + new Date().toLocaleTimeString('de-DE', { 
                                            hour: "numeric", 
                                            minute: "numeric",
                                            second: "numeric" }) + ']  ';
}

// REST
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/anonchat', (req, res) => {
  res.sendFile(__dirname + '/public/anonchat.html');
});

// Sockets
io.on('connection', (socket) => {
  io.emit('chat message', getZeit() + 'A user joined.');
  console.log('A user joined.');

  socket.on('disconnect', () => {
    io.emit('chat message', getZeit() + 'A user left.');
    console.log('A user left.');
  });

  socket.on('chat message', (msg) => {
    console.log(msg);
    io.emit('chat message', getZeit() + msg);
  });
});
