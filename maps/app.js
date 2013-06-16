
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
var portName = '/dev/tty.PL2303-004313FD';
//var portName = '/dev/ttyUSB0';
var sp = new serialport.SerialPort(portName, {
    baudRate: 38400,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: true,
    parser: serialport.parsers.readline("\n")
});

// NMEA
var nmea = require('nmea');

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

    var nmeaData = nmea.parse(input);
//    console.log(nmeaData);
    try {
        if (nmeaData.type === 'fix') {
//        nmeaData.lat = 3540.8581;
//        nmeaData.lon = 13945.9603;
            var latlon = new Object();
            latlon.nmeaLat = nmeaData.lat;
            latlon.nmeaLon = nmeaData.lon;
            codeLatLng(latlon);
            console.log('LAT: ' + latlon.lat);
            console.log('LON: ' + latlon.lon);
            // つながっているクライアント全員に送信
            io.sockets.json.emit('message', { value: latlon });
        }
    } catch (err) {
        console.log('uncaughtException => ' + err);
    }
});

sp.on('close', function(err) {
    console.log('port closed');
});

sp.on('open', function(err) {
    console.log('port opened');
});

function se2dec(point){
    var point1 = Math.floor( point/100 );
    var point2 = point - point1*100;
    return point1 + point2/60;
}

function codeLatLng(value) {
//    console.log('NMEA-LAT: ' + value.nmeaLat);
//    console.log('NMEA-LON: ' + value.nmeaLon);

    value.lat = se2dec(value.nmeaLat);
    value.lon = se2dec(value.nmeaLon);
    return value;
}

// 追加。catchされなかった例外の処理設定。
process.on('uncaughtException', function (err) {
    console.log('uncaughtException => ' + err);
});