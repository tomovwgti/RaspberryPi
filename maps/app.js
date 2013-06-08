
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path')
    , serialport = require('serialport');

var app = express()
    , http = require('http')
    , server = http.createServer(app)
    , io = require('socket.io').listen(server);

// Serial Port
var portName = '/dev/tty.PL2303-000013FA';
var sp = new serialport.SerialPort(portName, {
    baudRate: 38400,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: true,
    parser: serialport.parsers.readline("\n")
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

// クライアントの接続を待つ(IPアドレスとポート番号を結びつけます)
server.listen(3000);

// クライアントが接続してきたときの処理
io.sockets.on('connection', function(socket) {
    console.log("connection");
    // メッセージを受けたときの処理
    socket.on('message', function(data) {
        // つながっているクライアント全員に送信
        console.log("message");
        socket.broadcast.emit('message', { value: data.value });
    });

    // クライアントが切断したときの処理
    socket.on('disconnect', function(){
        console.log("disconnect");
    });
});

// data from Serial port
sp.on('data', function(input) {

    var buffer = new Buffer(input, 'utf8');
    var receive = buffer.toString();
//    console.log(receive);
    if (receive.indexOf('$GPGGA') === -1) {
        return;
    }
    // NMEAの解析
    CaliculateNmea(receive);
       // つながっているクライアント全員に送信
//    io.sockets.json.emit('message', { value: jsonData });
});

sp.on('close', function(err) {
    console.log('port closed');
});

sp.on('open', function(err) {
    console.log('port opened');
});

// NMEAの解析
function CaliculateNmea(receive) {
    console.log(receive);
    var data = receive.split(',');
    var time = data[1];
    var n = 3540.8581;//data[2];
    var e = 13945.9603;//data[4];
    var valid = data[6];
    console.log('Time: ' + time);
    console.log('N: ' + n);
    console.log('E: ' + e);
    console.log('Valid: ' + valid);
    var deg = n.substring(0,2);
    var min = n.substring(2,4);
    var sec = n.substring()
}