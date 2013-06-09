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

    // WebSocketでの接続
    socket.on('connect', function(msg) {
        console.log("connect");
    });

    var i = 0.0;
    // メッセージを受けたとき
    socket.on('message', function(msg) {
        var lat = msg.value.lat;
        var lon = msg.value.lon;
        i = i + 0.1
//        console.log(lat);
//        console.log(lon);
        var currentLocation = new google.maps.LatLng(lat, lon);
        map.panTo(new google.maps.LatLng(lat, lon));
        var marker = new google.maps.Marker({
            position: currentLocation,
            map: map
        });
    });

    window.onload = function() {
        var mapOptions = {
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($('#map-canvas').get(0),
            mapOptions);

        // Try HTML5 geolocation
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);

                var infowindow = new google.maps.InfoWindow({
                    map: map,
                    position: pos
                });

                map.setCenter(pos);
            }, function() {
                handleNoGeolocation(true);
            });
        } else {
            // Browser doesn't support Geolocation
            handleNoGeolocation(false);
        }
    }

    /**
     * GeoLocation
     * @param errorFlag
     */
    function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
        } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }

        var options = {
            map: map,
            position: new google.maps.LatLng(60, 105),
            content: content
        };

        var infowindow = new google.maps.InfoWindow(options);
        map.setCenter(options.position);
    }
}(this));