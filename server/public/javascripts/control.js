/**
 * Created with JetBrains WebStorm.
 * User: tomo
 * Date: 2013/01/17
 * Time: 23:56
 * To change this template use File | Settings | File Templates.
 */

$(function() {
    $('#knob').knob({
        'change' : function(value) {
            console.log(value);
            SendMsg(value);
        }
    });

    $('#reset_btn').click(function() {
        $('#knob').val(0).trigger('change');
        SendMsg(0);
    });

    var socket = io.connect();

    // WebSocketでの接続
    socket.on('connect', function(msg) {
        console.log("connect");
    });

    // メッセージを受信
    socket.on('message', function(msg) {
        console.log("value: " + msg.value);
        // ノブの値を更新
        $('#knob').val(msg.value).trigger('change');
    });

    // メッセージを送信する
    function SendMsg(msg) {
        // メッセージを送信
        socket.emit('message', { value: msg });
    }

    // 切断する
    function DisConnect() {
        // socketを切断する
        socket.disconnect();
        console.log("disconnect");
    }
});
