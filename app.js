const express = require('express');
const app = express();
const path = require('path');
const https = require('https');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

require('dotenv').config({ path:'.env' });

const server = https.createServer(app);
const io = new Server(server, { 
    cors: {
      origin:'*'
    } 
});

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// required socket-client & public folder
app.use('/public',express.static('public'));
app.use('/socket-client',express.static('node_modules/socket.io/client-dist'));

app.set('views',path.join(__dirname,'views'));

app.set('view engine','ejs');

io.on("connection", (socket) => {
  // console.log('a user connected!');
  socket.on('mm',(data) =>{
    // io.emit('event', data);
    console.log(data);
  });
});

// io.use((socket, next) => {
  
//   const token = socket.handshake.auth.token;

//   if (token!=='123#'){
//     next(new Error('error token!'));
//   } else {
//     next();
//   }
// });
// io.use((socket, next) => {
//   next();
// });

app.get('/',(req, res) => {
  let status = req.query.status;
  res.render('index',{
      status:status
    });
});

app.get('/apisocks',(req, res) => {
    let token = req.query.token;
    if (token!==process.env.TOKEN){
      res.redirect('/');
    } else {
      res.render('apis');
      // res.redirect('/apisocks?token='+token);
    }
});

app.post('/auth',(req, res) => {
    let token = req.body.data_input_tokens;
    if (token===process.env.TOKEN){
      res.redirect('/apisocks?token='+token);
    } else {
      res.redirect('/?status=error');
    }
});

app.post('/sending_api',(req, res) => {
  if (req.query.token===process.env.TOKEN){
    let text={
      text:'success',
      data:req.body.data_input
    };
    io.on("connection", (socket) => {
      // console.log('a user connected!');
      socket.emit('ondata', text);
    });
    console.log(req.body.data_input);
    res.redirect('/apisocks');
  } else {
    res.status(404).json({
      info:'error!',
      message:'error your token!'
    });
  }
});


var port = process.env.PORT||5000;

server.listen(port,() => {
  console.log('listen at server.. http://localhost:', port);
});
