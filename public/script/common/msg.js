define( function( require, exports, module ){

    if (window.webkitNotifications) {
        console.log("Notifications are supported!");
    }
    else {
        console.log("Notifications are not supported for this Browser/OS version yet.");
    }

    function createAndFill( icon, title, content ){
        if (window.webkitNotifications.checkPermission() === 0) {
            // 0 is PERMISSION_ALLOWED
            // function defined in step 2
            window.webkitNotifications.createNotification(
                icon, title, content).show();
        } else {
            window.webkitNotifications.requestPermission();
        }
    }

    var presetIcon = {
        default: '/img/Sparrow_icon.png',
        // gif is not support
        // loading: 'loading_small.gif',
        cmt_suc: ''
    };

    var Msg = {
        pop: function( option ){
            var icon = presetIcon[ option.icon || 'default' ],
                title = option.title || 'chenllos tells you:',
                content = option.content || '42';
            createAndFill( icon, title, content );
        }
    };

    module.exports = Msg;
} );