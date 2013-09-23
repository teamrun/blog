function hideMiddle(){
    var ms = document.querySelectorAll('.bubble');
    var len = ms.length;
    for(var i=0; i<len; i++){
        ms[i].style.height = '0px';
        ms[i].style.overFlow = 'hidden';
    }
}