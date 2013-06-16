/**
 * Created with JetBrains WebStorm.
 * User: tomo
 * Date: 2013/05/31
 * Time: 22:31
 * To change this template use File | Settings | File Templates.
 */

$(function (global) {
    var socket = io.connect();
    var map;
    var prevLocation = null;
    var currentMarker = new google.maps.Marker();
    var prevMarker = new google.maps.Marker();
    var patharray = new Array();
    var image = 'images/cabs.png';

    // WebSocketでの接続
    socket.on('connect', function(msg) {
        console.log("connect");
    });

    var i = 0.0;
    // メッセージを受けたとき
    socket.on('message', function(msg) {
        if (prevLocation === null) {
            // 最初の位置が決まらない場合は無視
            return;
        }

        var lat = msg.value.lat;
        var lon = msg.value.lon;
        i = i + 0.1
//        console.log(lat);
//        console.log(lon);
        var currentLocation = new google.maps.LatLng(lat, lon);
        // 同じ位置なら描画しない
        if (prevLocation.lat() === currentLocation.lat() &&
            prevLocation.lng() === currentLocation.lng()) {
            return;
        }
        // 前のマーカを消す
        prevMarker.setOptions({visible:false});
        // 現在地への移動
        map.panTo(new google.maps.LatLng(lat, lon));
        // 現在地にマーカを設置
        currentMarker.setOptions({
            icon: image,
            position: currentLocation,
            map: map,
            visible: true,
            flat:true
        });

        // 線を引く
        patharray[0] = prevLocation;
        patharray[1] = currentLocation;

        // Polylineの初期設定
        var polylineOpts = {
            map: map,
            strokeColor: '#0055FF',
            strokeOpacity: 0.7,
            strokeWeight: 5,
            path: patharray
        };

        // 直前で作成したPolylineOptionsを利用してPolylineを作成
        var polyline = new google.maps.Polyline(polylineOpts);

        // マーカーと位置情報を保存
        prevMarker = currentMarker;
        prevLocation = currentLocation;
    });

    window.onload = function() {
        var mapOptions = {
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($('#map-canvas').get(0),
            mapOptions);

        // 初期値は新宿 35.689771,139.696891
        var pos = new google.maps.LatLng(35.689771,139.696891);
        var infowindow = new google.maps.InfoWindow({
            map: map,
            position: pos
        });

        map.setCenter(pos);
        prevLocation = pos;
        prevMarker.setPosition(prevLocation);
    }
}(this));