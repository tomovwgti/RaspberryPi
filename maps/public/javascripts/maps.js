/**
 * Created with JetBrains WebStorm.
 * User: tomo
 * Date: 2013/04/21
 * Time: 11:57
 * To change this template use File | Settings | File Templates.
 */

var map;

function initialize() {
    var mapOptions = {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    // Try HTML5 geolocation
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);

            var infowindow = new google.maps.InfoWindow({
                map: map,
                position: pos,
                content: 'Location found using HTML5.'
            });

            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });

        google.maps.event.addListener(map, 'click', function(e) {
            var marker = placeMarker(e.latLng, map);
            google.maps.event.addListener(marker, 'click', function() {
                console.log('CLICK');
                infoWindow.open(map, marker);
            });
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
}

var infoWindow = new google.maps.InfoWindow({
    content: 'TESTTETSTSTE'
});

function placeMarker(position, map) {
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: 'TEST'
    });
    console.log('lat: ' + position.lat() + ', lon: ' + position.lng());
    return marker;
}

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

google.maps.event.addDomListener(window, 'load', initialize);
