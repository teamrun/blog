var fs = require('fs');

var should = require('should')

var markdown = require('markdown').markdown;

// var requiredTest = require('./test-md');
// var mdTxtPath = 

var mdStr = fs.readFileSync('./test/md.txt', 'utf8');
// console.log( mdStr );

function mdFilter( mdStr ){
    return markdown.toHTML( mdStr )
}

describe('markdown module works as i expext', function(){
    var output = mdFilter( mdStr );
    it('should has code in output', function(){
        
        // console.log( output );
        (output.indexOf('<code>')).should.be.above(-1);
    });

    it('should has block code in output', function(){
        (output.indexOf('<pre><code>')).should.be.above(-1);
    });
});