const { createServer } = require('http');
const { Server } = require('socket.io');

const myServer = createServer();
const io = new Server(myServer, { 
    cors: {
      origin:'https://qr.buildercorp.id'
    } 
});

io.on("connection", (socket) => {
  console.log('a user connected!');
  socket.on('event',(data) =>{
    io.emit('event', data);
    console.log(data);
  });
});

io.use((socket, next) => {
  
  const token = socket.handshake.auth.token;

  if (token!=='123#'){
    next(new Error('error token!'));
  } else {
    next();
  }
});
io.use((socket, next) => {
  next();
});

myServer.listen(4040,()=>{
  console.log('listen at server..');
});
