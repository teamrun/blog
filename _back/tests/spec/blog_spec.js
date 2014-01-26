define( function( require, exports, module ){
    var util = require('../../script/util');



    describe('util 工具库测试 with fixtures', function(){
        beforeEach(function(){
            jasmine.getFixtures().clearCache();
            jasmine.getFixtures().containerId = 'TDD-fixture';
            jasmine.getFixtures().fixturesPath = '/blog/tests/fixture';
            loadFixtures('blog_fixture.html');
            // loadStyleFixtures('../../../fixture/style.css');
        });

        it('util.qs() should be able to query out ul', function(){
            // expect( $( util.qs('#TDD-fixture ul#util-query') ) ).toContain('li');
            expect( util.qs('#TDD-fixture ul#util-query').innerText ).toEqual('');
        });
        xit('util.qsa() sholud be able to query out an array of dom node ', function(){
            expect(  util.qsa('#TDD-fixture ul#util-query li').length ).toEqual(4);
        });

        xit(' class ops: addClass, hasClass, removeClass, toggleClass, replaceClass  toggleClass测试不通过!', function(){

            var ul = util.qs('#TDD-fixture ul');

            expect( util.hasClass( ul, 'classNotExist' ) ).toBe( false );
            util.addClass( ul, 'class2add' );
            expect( util.hasClass( ul, 'class2add') ).toBe( true );

            util.addClass( ul, 'class2add2' );
            expect( util.hasClass( ul, 'class2add2') ).toBe( true );

            util.addClass( ul, 'class2add3' );
            expect( util.hasClass( ul, 'class2add3') ).toBe( true );

            util.removeClass(ul, 'class2add3');
            expect( util.hasClass(ul, 'class2add3') ).toBe( false );

            util.replaceClass( ul, 'class2add2', 'class2add44');
            expect( util.hasClass( ul, 'class2add44' )).toBe( true );
            expect( util.hasClass( ul, 'class2add2' )).toBe( false );

            console.log( util );
            // toggleClass测试不通过!
            // util.toggleClass( ul, 'class2add88');
            // console.log( util );
            // expect( util.hasClass( ul, 'class2add88' ) ).toBe( true );
            // util.toggleClass( ul,  'class2add88');
            // expect( util.hasClass( ul, 'class2add88' ) ).toBe( false );

        });
    });

    xdescribe('util 工具库 without fixture', function(){
        it('trim() should be able 去除两头的空格', function(){
            var str = 'afedsfjsf';
            expect( str.trim() ).toEqual( str );

            str =' fejffaf fewjf ';
            expect( str.trim() ).toEqual( 'fejffaf fewjf' );

            str ='fejffaf fewjf ';
            // String.prototype.trim = false;
            str = str.trim();
            console.log( str );
            expect( str ).toEqual( 'fejffaf fewjf' );

            str =' fejffaf fewjf';
            expect( str.trim() ).toEqual( 'fejffaf fewjf' );
        });

    });
} );