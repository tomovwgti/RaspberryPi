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
        }
    });

    $('#reset_btn').click(function() {
        console.log("click");
        $('#knob').val(0).trigger('change');
    });
});
