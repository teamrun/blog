define(function(require, exports, module){
    // var util = require('./util');

    var Btn;

    window.onload =function(){
        Btn = document.querySelector('.btn');
        if( window.location.href.indexOf( 'pec' ) < 0){
            bindClick( Btn );
        }
    };
    
    function bindClick( obj ){
        console.log('我已经呗调用了');
        console.log( obj );
        if( obj ){
            obj.onclick = function(){
                if( document.body.className !== '' ){
                    document.body.className = '';
                }
                else{
                    document.body.className = 'menushow';
                }
            };
        }
    }

    function addClass(){
        document.body.className = 'menushow';
        Btn.onclick =removeClass;
    }

    function  removeClass(){
        document.body.className = '';
        Btn.onclick = addClass;
    }
});