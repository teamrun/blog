describe('my First mobileApp spec, test fixtrue', function(){

    jasmine.getFixtures().fixturesPath = '/mobile/';

   

    it('shoud add "menushow" class to body after click that btn', function(){
        // 载入html代码
        loadFixtures('index_rc.html');
        console.log( $('#jasmine-fixtures').html() );

        bindClick( document.querySelector('.btn') );
        console.log( $('.btn').get(0).onclick );
        

        // event spy
        var spyEvent = spyOnEvent('.btn', 'click');
        $('.btn').click();
        expect('click').toHaveBeenTriggeredOn('.btn');
        expect(spyEvent).toHaveBeenTriggered();




        // 事件激发
        // $('.btn').trigger('click');
        expect( document.body ).toHaveClass('menushow');
        console.log(  'body的类为: ' + document.body.className );
    });
});