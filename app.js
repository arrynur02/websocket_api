const express = require('express');
const app = express();
const path = require('path');
const https = require('https');
const http = require('http');
const cors = require('cors');
const{ WebSocketServer } = require('ws');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

require('dotenv').config({ path:'.env' });

const server = http.createServer(app);

app.use(cors({
    origin:["https://qr.buildercorp.id","https://103.134.152.9:8080","*"]
}))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// required socket-client & public folder
app.use('/public',express.static('public'));
app.use('/socket-client',express.static('node_modules/socket.io/client-dist'));

app.set('views',path.join(__dirname,'views'));

app.set('view engine','ejs');

const wss = new WebSocketServer({ server:server });

function getId(length) {
  var result='';
  var characters='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var characterLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characterLength))
  }
  return result;
}

function msgWebsocket(id, data, status){
  return JSON.stringify({
    type: "message",
    id:id,
    text: data,
    status:'success',
    date: Date.now()
  });
}

wss.on('connection', function connection(ws, req) {
  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      // console.log(client);
      if (client.readyState) {
        client.send(data, { binary: isBinary });
      }
    });
  });

  ws.send(msgWebsocket(getId(15),'connect user..',200));
});

app.get('/',(req, res) => {
  let data = {
    uid:getId(15)
  }
  res.render('apis', data);
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

app.post('/sending_api',(req, res) => {
  if (req.query.token===process.env.TOKEN){
    let text={
      text:'success',
      data:req.body.data_input
    };
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
  console.log('listen server at http://localhost:'+port);
});
