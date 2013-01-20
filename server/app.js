
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);

// Socket.IO Log Level
io.set('log level', 1);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

// GPIO Peripheral
// Full Color LED
// R - GPIO4 : 23
// G - GPIO3 : 24
// B - GPIO1 : 18 : PWM
var exec = require('child_process').exec;

exec('gpio -g mode 18 pwm');
exec('gpio -g mode 23 write');
exec('gpio -g mode 24 write');

// ソケットを作る
var socketIO = require('socket.io');
// クライアントの接続を待つ
server.listen(app.get('port'));

// クライアントが接続してきたときの処理
io.sockets.on('connection', function(socket) {
    console.log("connection");
    // メッセージを受けた時の処理
    socket.on('message', function(data) {
        // 接続していクライアントに全てに送信
        //console.log("value: " + data.value);
        socket.broadcast.emit('message', { value: data.value });
        // B
        //console.log("B: " + data.value % 1024);
        exec('gpio -g pwm 18 ' + data.value % 1024);
        // G
        if ((1024 <= data.value && data.value < 2047) || (3072 <= data.value && data.value < 4095) ) {
            //console.log("G: " + 1);
            exec('gpio -g write 23 1');
        } else {
            //console.log("G: " + 0);
            exec('gpio -g write 23 0');
        }
        // R
        if ((2048 <= data.value && data.value < 3071) || (3072 <= data.value && data.value < 4095) ) {
            //console.log("R: " + 1);
            exec('gpio -g write 24 1');
        } else {
            //console.log("R: " + 0);
            exec('gpio -g write 24 0');
        }
    });

    // クライアントが切断した時に処理
    socket.on('disconnection', function() {
        console.log("disconnection");
    });
});