
/*--------------------------------------------------------*/
/*
 * @source file: ./prism.js   http://prismjs.com/    plugin: prism.css
 * 
 * @已添加的语言: 
 *              Markup         0.62KB
 *              CSS            0.62KB
 *              CSS Extras     0.69KB
 *              C-like         0.69KB
 *              JavaScript     0.72KB
 *              CoffeeScript   0.71KB
 *              Python         0.49KB
 *              Ruby           0.87KB
 *
 * @已添加的插件: 
 *              Line Highlight      2.44KB
 *              Line Numbers        1.19KB
 *              File Highlight      0.75KB
 *
 * @Total filesize:      15.15KB (78% JavaScript + 22% CSS)
 *
 */
/*----------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------*/
/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

(function(){

// Private helper vars
var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

var _ = self.Prism = {
  util: {
    type: function (o) { 
      return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
    },
    
    // Deep clone a language definition (e.g. to extend it)
    clone: function (o) {
      var type = _.util.type(o);

      switch (type) {
        case 'Object':
          var clone = {};
          
          for (var key in o) {
            if (o.hasOwnProperty(key)) {
              clone[key] = _.util.clone(o[key]);
            }
          }
          
          return clone;
          
        case 'Array':
          return o.slice();
      }
      
      return o;
    }
  },
  
  languages: {
    extend: function (id, redef) {
      var lang = _.util.clone(_.languages[id]);
      
      for (var key in redef) {
        lang[key] = redef[key];
      }
      
      return lang;
    },
    
    // Insert a token before another token in a language literal
    insertBefore: function (inside, before, insert, root) {
      root = root || _.languages;
      var grammar = root[inside];
      var ret = {};
        
      for (var token in grammar) {
      
        if (grammar.hasOwnProperty(token)) {
          
          if (token == before) {
          
            for (var newToken in insert) {
            
              if (insert.hasOwnProperty(newToken)) {
                ret[newToken] = insert[newToken];
              }
            }
          }
          
          ret[token] = grammar[token];
        }
      }
      
      return root[inside] = ret;
    },
    
    // Traverse a language definition with Depth First Search
    DFS: function(o, callback) {
      for (var i in o) {
        callback.call(o, i, o[i]);
        
        if (_.util.type(o) === 'Object') {
          _.languages.DFS(o[i], callback);
        }
      }
    }
  },

  highlightAll: function(async, callback) {
    var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

    for (var i=0, element; element = elements[i++];) {
      _.highlightElement(element, async === true, callback);
    }
  },
  highlightRenderedMDPage: function( async, callback ){
      var elements = document.querySelectorAll('pre code');

      for (var i=0, element; element = elements[i++];) {
          // element.className = 'language-markup';
          var langSign = /[\$|`{3}]/g;
          var langReg = new RegExp( '[\$|`{3}].+[\$|`{3}]' );
          // old:
          // var langtype = element.innerText.match( langReg )[0];
          

          // new
          var matchResult = element.innerText.match( langReg );
          var langtype = matchResult? matchResult[0] : 'unknown';
          // console.log('lang type: ' + matchResult );


          if( element.className.indexOf('language-') < 0 ){
            element.innerText = element.innerText.replace( /[\$|```].+[\$|```]\n+/, '' );
            element.className = 'language-' + langtype.replace( langSign, '');

            element.parentNode.className = element.parentNode.className + ' line-numbers';

            // console.log( langtype );
            _.highlightElement(element, async === true, callback);
          }
          else{
            continue;
          }
          
      }
  },
    
  highlightElement: function(element, async, callback) {
    // Find language
    var language, grammar, parent = element;
    
    while (parent && !lang.test(parent.className)) {
      parent = parent.parentNode;
    }
    
    if (parent) {
      language = (parent.className.match(lang) || [,''])[1];
      grammar = _.languages[language];
    }

    if (!grammar) {
      return;
    }
    
    // Set language on the element, if not present
    element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
    
    // Set language on the parent, for styling
    parent = element.parentNode;
    
    if (/pre/i.test(parent.nodeName)) {
      parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language; 
    }

    var code = element.textContent;
    
    if(!code) {
      return;
    }
    
    code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
    
    var env = {
      element: element,
      language: language,
      grammar: grammar,
      code: code
    };
    
    _.hooks.run('before-highlight', env);
    
    if (async && self.Worker) {
      var worker = new Worker(_.filename);  
      
      worker.onmessage = function(evt) {
        env.highlightedCode = Token.stringify(JSON.parse(evt.data), language);

        _.hooks.run('before-insert', env);

        env.element.innerHTML = env.highlightedCode;
        
        callback && callback.call(env.element);
        _.hooks.run('after-highlight', env);
      };
      
      worker.postMessage(JSON.stringify({
        language: env.language,
        code: env.code
      }));
    }
    else {
      env.highlightedCode = _.highlight(env.code, env.grammar, env.language)

      _.hooks.run('before-insert', env);

      env.element.innerHTML = env.highlightedCode;
      
      callback && callback.call(element);
      
      _.hooks.run('after-highlight', env);
    }
  },
  
  highlight: function (text, grammar, language) {
    return Token.stringify(_.tokenize(text, grammar), language);
  },
  
  tokenize: function(text, grammar, language) {
    var Token = _.Token;
    
    var strarr = [text];
    
    var rest = grammar.rest;
    
    if (rest) {
      for (var token in rest) {
        grammar[token] = rest[token];
      }
      
      delete grammar.rest;
    }
                
    tokenloop: for (var token in grammar) {
      if(!grammar.hasOwnProperty(token) || !grammar[token]) {
        continue;
      }
      
      var pattern = grammar[token], 
        inside = pattern.inside,
        lookbehind = !!pattern.lookbehind,
        lookbehindLength = 0;
      
      pattern = pattern.pattern || pattern;
      
      for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop
        
        var str = strarr[i];
        
        if (strarr.length > text.length) {
          // Something went terribly wrong, ABORT, ABORT!
          break tokenloop;
        }
        
        if (str instanceof Token) {
          continue;
        }
        
        pattern.lastIndex = 0;
        
        var match = pattern.exec(str);
        
        if (match) {
          if(lookbehind) {
            lookbehindLength = match[1].length;
          }

          var from = match.index - 1 + lookbehindLength,
              match = match[0].slice(lookbehindLength),
              len = match.length,
              to = from + len,
            before = str.slice(0, from + 1),
            after = str.slice(to + 1); 

          var args = [i, 1];
          
          if (before) {
            args.push(before);
          }
          
          var wrapped = new Token(token, inside? _.tokenize(match, inside) : match);
          
          args.push(wrapped);
          
          if (after) {
            args.push(after);
          }
          
          Array.prototype.splice.apply(strarr, args);
        }
      }
    }

    return strarr;
  },
  
  hooks: {
    all: {},
    
    add: function (name, callback) {
      var hooks = _.hooks.all;
      
      hooks[name] = hooks[name] || [];
      
      hooks[name].push(callback);
    },
    
    run: function (name, env) {
      var callbacks = _.hooks.all[name];
      
      if (!callbacks || !callbacks.length) {
        return;
      }
      
      for (var i=0, callback; callback = callbacks[i++];) {
        callback(env);
      }
    }
  }
};

var Token = _.Token = function(type, content) {
  this.type = type;
  this.content = content;
};

Token.stringify = function(o, language, parent) {
  if (typeof o == 'string') {
    return o;
  }

  if (Object.prototype.toString.call(o) == '[object Array]') {
    return o.map(function(element) {
      return Token.stringify(element, language, o);
    }).join('');
  }
  
  var env = {
    type: o.type,
    content: Token.stringify(o.content, language, parent),
    tag: 'span',
    classes: ['token', o.type],
    attributes: {},
    language: language,
    parent: parent
  };
  
  if (env.type == 'comment') {
    env.attributes['spellcheck'] = 'true';
  }
  
  _.hooks.run('wrap', env);
  
  var attributes = '';
  
  for (var name in env.attributes) {
    attributes += name + '="' + (env.attributes[name] || '') + '"';
  }
  
  return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';
  
};

if (!self.document) {
  // In worker
  self.addEventListener('message', function(evt) {
    var message = JSON.parse(evt.data),
        lang = message.language,
        code = message.code;
    
    self.postMessage(JSON.stringify(_.tokenize(code, _.languages[lang])));
    self.close();
  }, false);
  
  return;
}

// Get current script and highlight
var script = document.getElementsByTagName('script');

script = script[script.length - 1];

if (script) {
  _.filename = script.src;
  
  if (document.addEventListener && !script.hasAttribute('data-manual')) {
    // 页面中有两个document的话(有iframe, 或其他插件), 只执行一次
    document.addEventListener('DOMContentLoaded', function(){
      _.highlightRenderedMDPage();
      document.removeEventListener();
    });
  }
}

})();;
Prism.languages.markup = {
  'comment': /&lt;!--[\w\W]*?-->/g,
  'prolog': /&lt;\?.+?\?>/,
  'doctype': /&lt;!DOCTYPE.+?>/,
  'cdata': /&lt;!\[CDATA\[[\w\W]*?]]>/i,
  'tag': {
    pattern: /&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
    inside: {
      'tag': {
        pattern: /^&lt;\/?[\w:-]+/i,
        inside: {
          'punctuation': /^&lt;\/?/,
          'namespace': /^[\w-]+?:/
        }
      },
      'attr-value': {
        pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
        inside: {
          'punctuation': /=|>|"/g
        }
      },
      'punctuation': /\/?>/g,
      'attr-name': {
        pattern: /[\w:-]+/g,
        inside: {
          'namespace': /^[\w-]+?:/
        }
      }
      
    }
  },
  'entity': /&amp;#?[\da-z]{1,8};/gi
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

  if (env.type === 'entity') {
    env.attributes['title'] = env.content.replace(/&amp;/, '&');
  }
});
;
Prism.languages.css = {
  'comment': /\/\*[\w\W]*?\*\//g,
  'atrule': {
    pattern: /@[\w-]+?.*?(;|(?=\s*{))/gi,
    inside: {
      'punctuation': /[;:]/g
    }
  },
  'url': /url\((["']?).*?\1\)/gi,
  'selector': /[^\{\}\s][^\{\};]*(?=\s*\{)/g,
  'property': /(\b|\B)[\w-]+(?=\s*:)/ig,
  'string': /("|')(\\?.)*?\1/g,
  'important': /\B!important\b/gi,
  'ignore': /&(lt|gt|amp);/gi,
  'punctuation': /[\{\};:]/g
};

if (Prism.languages.markup) {
  Prism.languages.insertBefore('markup', 'tag', {
    'style': {
      pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/ig,
      inside: {
        'tag': {
          pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/ig,
          inside: Prism.languages.markup.tag.inside
        },
        rest: Prism.languages.css
      }
    }
  });
};
Prism.languages.css.selector = {
  pattern: /[^\{\}\s][^\{\}]*(?=\s*\{)/g,
  inside: {
    'pseudo-element': /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/g,
    'pseudo-class': /:[-\w]+(?:\(.*\))?/g,
    'class': /\.[-:\.\w]+/g,
    'id': /#[-:\.\w]+/g
  }
};

Prism.languages.insertBefore('css', 'ignore', {
  'hexcode': /#[\da-f]{3,6}/gi,
  'entity': /\\[\da-f]{1,8}/gi,
  'number': /[\d%\.]+/g,
  'function': /(attr|calc|cross-fade|cycle|element|hsla?|image|lang|linear-gradient|matrix3d|matrix|perspective|radial-gradient|repeating-linear-gradient|repeating-radial-gradient|rgba?|rotatex|rotatey|rotatez|rotate3d|rotate|scalex|scaley|scalez|scale3d|scale|skewx|skewy|skew|steps|translatex|translatey|translatez|translate3d|translate|url|var)/ig
});;
Prism.languages.clike = {
  'comment': {
    pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])\/\/.*?(\r?\n|$))/g,
    lookbehind: true
  },
  'string': /("|')(\\?.)*?\1/g,
  'class-name': {
    pattern: /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,
    lookbehind: true,
    inside: {
      punctuation: /(\.|\\)/
    }
  },
  'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
  'boolean': /\b(true|false)\b/g,
  'function': {
    pattern: /[a-z0-9_]+\(/ig,
    inside: {
      punctuation: /\(/
    }
  },
  'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
  'operator': /[-+]{1,2}|!|&lt;=?|>=?|={1,3}|(&amp;){1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
  'ignore': /&(lt|gt|amp);/gi,
  'punctuation': /[{}[\];(),.:]/g
};
;
Prism.languages.javascript = Prism.languages.extend('clike', {
  'keyword': /\b(var|let|if|else|while|do|for|return|in|instanceof|function|get|set|new|with|typeof|try|throw|catch|finally|null|break|continue)\b/g,
  'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g
});

Prism.languages.insertBefore('javascript', 'keyword', {
  'regex': {
    pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
    lookbehind: true
  }
});

if (Prism.languages.markup) {
  Prism.languages.insertBefore('markup', 'tag', {
    'script': {
      pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/ig,
      inside: {
        'tag': {
          pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/ig,
          inside: Prism.languages.markup.tag.inside
        },
        rest: Prism.languages.javascript
      }
    }
  });
}
;
Prism.languages.coffeescript = Prism.languages.extend('javascript', {
  'block-comment': /([#]{3}\s*\r?\n(.*\s*\r*\n*)\s*?\r?\n[#]{3})/g,
  'comment': /(\s|^)([#]{1}[^#^\r^\n]{2,}?(\r?\n|$))/g,
  'keyword': /\b(this|window|delete|class|extends|namespace|extend|ar|let|if|else|while|do|for|each|of|return|in|instanceof|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/g
});

Prism.languages.insertBefore('coffeescript', 'keyword', {
  'function': {
    pattern: /[a-z|A-z]+\s*[:|=]\s*(\([.|a-z\s|,|:|{|}|\"|\'|=]*\))?\s*-&gt;/gi,
    inside: {
      'function-name': /[_?a-z-|A-Z-]+(\s*[:|=])| @[_?$?a-z-|A-Z-]+(\s*)| /g,
      'operator': /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g
    }
  },
  'attr-name': /[_?a-z-|A-Z-]+(\s*:)| @[_?$?a-z-|A-Z-]+(\s*)| /g
});
;
Prism.languages.scss = Prism.languages.extend('css', {
  'comment': {
    pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
    lookbehind: true
  },
  // aturle is just the @***, not the entire rule (to highlight var & stuffs)
  // + add ability to highlight number & unit for media queries
  'atrule': /@[\w-]+(?=\s+(\(|\{|;))/gi,
  // url, compassified
  'url': /([-a-z]+-)*url(?=\()/gi,
  // CSS selector regex is not appropriate for Sass
  // since there can be lot more things (var, @ directive, nesting..)
  // a selector must start at the end of a property or after a brace (end of other rules or nesting)
  // it can contain some caracters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
  // the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
  // can "pass" as a selector- e.g: proper#{$erty})
  // this one was ard to do, so please be careful if you edit this one :)
  'selector': /([^@;\{\}\(\)]?([^@;\{\}\(\)]|&amp;|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm
});

Prism.languages.insertBefore('scss', 'atrule', {
  'keyword': /@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return)|(?=@for\s+\$[-_\w]+\s)+from/i
});

Prism.languages.insertBefore('scss', 'property', {
  // var and interpolated vars
  'variable': /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i
});

Prism.languages.insertBefore('scss', 'ignore', {
  'placeholder': /%[-_\w]+/i,
  'statement': /\B!(default|optional)\b/gi,
  'boolean': /\b(true|false)\b/g,
  'null': /\b(null)\b/g,
  'operator': /\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g
});
;
Prism.languages.bash = Prism.languages.extend('clike', {
  'comment': {
    pattern: /(^|[^"{\\])(#.*?(\r?\n|$))/g,
    lookbehind: true
  },
  'string': {
    //allow multiline string
    pattern: /("|')(\\?[\s\S])*?\1/g,
    inside: {
      //'property' class reused for bash variables
      'property': /\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^\}]+\})/g
    }
  },
  'keyword': /\b(if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)\b/g
});

Prism.languages.insertBefore('bash', 'keyword', {
  //'property' class reused for bash variables
  'property': /\$([a-zA-Z0-9_#\?\-\*!@]+|\{[^}]+\})/g
});
Prism.languages.insertBefore('bash', 'comment', {
  //shebang must be before comment, 'important' class from css reused
  'important': /(^#!\s*\/bin\/bash)|(^#!\s*\/bin\/sh)/g
});
;
Prism.languages.c = Prism.languages.extend('clike', {
  'keyword': /\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/g,
  'operator': /[-+]{1,2}|!=?|&lt;{1,2}=?|&gt;{1,2}=?|\-&gt;|={1,2}|\^|~|%|(&amp;){1,2}|\|?\||\?|\*|\//g
});

Prism.languages.insertBefore('c', 'keyword', {
    //property class reused for macro statements
    'property': {
        pattern:/#[a-zA-Z]+\ .*/g,
        inside: {
            property: /&lt;[a-zA-Z.]+>/g
        }   
    }   
});
;
Prism.languages.cpp = Prism.languages.extend('c', {
  'keyword': /\b(alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|delete\[\]|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|new\[\]|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/g,
  'operator': /[-+]{1,2}|!=?|&lt;{1,2}=?|&gt;{1,2}=?|\-&gt;|:{1,2}|={1,2}|\^|~|%|(&amp;){1,2}|\|?\||\?|\*|\/|\b(and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/g
});
;
Prism.languages.python= { 
  'comment': {
    pattern: /(^|[^\\])#.*?(\r?\n|$)/g,
    lookbehind: true
  },
  'string' : /("|')(\\?.)*?\1/g,
  'keyword' : /\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,
  'boolean' : /\b(True|False)\b/g,
  'number' : /\b-?(0x)?\d*\.?[\da-f]+\b/g,
  'operator' : /[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,
  'ignore' : /&(lt|gt|amp);/gi,
  'punctuation' : /[{}[\];(),.:]/g
};

;
Prism.languages.sql= { 
  'comment': {
    pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|((--)|(\/\/)|#).*?(\r?\n|$))/g,
    lookbehind: true
  },
  'string' : /("|')(\\?.)*?\1/g,
  'keyword' : /\b(ACTION|ADD|AFTER|ALGORITHM|ALTER|ANALYZE|APPLY|AS|ASC|AUTHORIZATION|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADE|CASCADED|CASE|CHAIN|CHAR VARYING|CHARACTER VARYING|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|CURRENT_USER|CURSOR|DATA|DATABASE|DATABASES|DATETIME|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DOUBLE PRECISION|DROP|DUMMY|DUMP|DUMPFILE|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE|ESCAPED BY|EXCEPT|EXEC|EXECUTE|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR|FOR EACH ROW|FORCE|FOREIGN|FREETEXT|FREETEXTTABLE|FROM|FULL|FUNCTION|GEOMETRY|GEOMETRYCOLLECTION|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY|IDENTITY_INSERT|IDENTITYCOL|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEY|KEYS|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONGBLOB|LONGTEXT|MATCH|MATCHED|MEDIUMBLOB|MEDIUMINT|MEDIUMTEXT|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTILINESTRING|MULTIPOINT|MULTIPOLYGON|NATIONAL|NATIONAL CHAR VARYING|NATIONAL CHARACTER|NATIONAL CHARACTER VARYING|NATIONAL VARCHAR|NATURAL|NCHAR|NCHAR VARCHAR|NEXT|NO|NO SQL|NOCHECK|NOCYCLE|NONCLUSTERED|NULLIF|NUMERIC|OF|OFF|OFFSETS|ON|OPEN|OPENDATASOURCE|OPENQUERY|OPENROWSET|OPTIMIZE|OPTION|OPTIONALLY|ORDER|OUT|OUTER|OUTFILE|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC|PROCEDURE|PUBLIC|PURGE|QUICK|RAISERROR|READ|READS SQL DATA|READTEXT|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURN|RETURNS|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROWCOUNT|ROWGUIDCOL|ROWS?|RTREE|RULE|SAVE|SAVEPOINT|SCHEMA|SELECT|SERIAL|SERIALIZABLE|SESSION|SESSION_USER|SET|SETUSER|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START|STARTING BY|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLE|TABLES|TABLESPACE|TEMPORARY|TEMPTABLE|TERMINATED BY|TEXT|TEXTSIZE|THEN|TIMESTAMP|TINYBLOB|TINYINT|TINYTEXT|TO|TOP|TRAN|TRANSACTION|TRANSACTIONS|TRIGGER|TRUNCATE|TSEQUAL|TYPE|TYPES|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNPIVOT|UPDATE|UPDATETEXT|USAGE|USE|USER|USING|VALUE|VALUES|VARBINARY|VARCHAR|VARCHARACTER|VARYING|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH|WITH ROLLUP|WITHIN|WORK|WRITE|WRITETEXT)\b/gi,
  'boolean' : /\b(TRUE|FALSE|NULL)\b/gi,
  'number' : /\b-?(0x)?\d*\.?[\da-f]+\b/g,
  'operator' : /\b(ALL|AND|ANY|BETWEEN|EXISTS|IN|LIKE|NOT|OR|IS|UNIQUE|CHARACTER SET|COLLATE|DIV|OFFSET|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b|[-+]{1}|!|=?&lt;|=?&gt;|={1}|(&amp;){1,2}|\|?\||\?|\*|\//gi,
  'ignore' : /&(lt|gt|amp);/gi,
  'punctuation' : /[;[\]()`,.]/g
};
;
Prism.languages.http = {
    'request-line': {
        pattern: /^(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b\shttps?:\/\/\S+\sHTTP\/[0-9.]+/g,
        inside: {
            // HTTP Verb
            property: /^\b(POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/g,
            // Path or query argument
            'attr-name': /:\w+/g
        }
    },
    'response-status': {
        pattern: /^HTTP\/1.[01] [0-9]+.*/g,
        inside: {
            // Status, e.g. 200 OK
            property: /[0-9]+[A-Z\s-]+$/g
        }
    },
    // HTTP header name
    keyword: /^[\w-]+:(?=.+)/gm
};

// Create a mapping of Content-Type headers to language definitions
var httpLanguages = {
    'application/json': Prism.languages.javascript,
    'application/xml': Prism.languages.markup,
    'text/xml': Prism.languages.markup,
    'text/html': Prism.languages.markup
};

// Insert each content type parser that has its associated language
// currently loaded.
for (var contentType in httpLanguages) {
    if (httpLanguages[contentType]) {
        var options = {};
        options[contentType] = {
            pattern: new RegExp('(content-type:\\s*' + contentType + '[\\w\\W]*?)\\n\\n[\\w\\W]*', 'gi'),
            lookbehind: true,
            inside: {
                rest: httpLanguages[contentType]
            }
        };
        Prism.languages.insertBefore('http', 'keyword', options);
    }
}
;
/**
 * Original by Samuel Flores
 *
 * Adds the following new token classes:
 *    constant, builtin, variable, symbol, regex
 */
Prism.languages.ruby = Prism.languages.extend('clike', {
  'comment': /#[^\r\n]*(\r?\n|$)/g,
  'keyword': /\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,
  'builtin': /\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
  'constant': /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g
});

Prism.languages.insertBefore('ruby', 'keyword', {
  'regex': {
    pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
    lookbehind: true
  },
  'variable': /[@$]+\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
  'symbol': /:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g
});
;
Prism.languages.go = Prism.languages.extend('clike', {
  'keyword': /\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g,
  'builtin': /\b(bool|byte|complex(64|128)|error|float(32|64)|rune|string|u?int(8|16|32|64|)|uintptr|append|cap|close|complex|copy|delete|imag|len|make|new|panic|print(ln)?|real|recover)\b/g,
  'boolean': /\b(_|iota|nil|true|false)\b/g,
  'operator': /([(){}\[\]]|[*\/%^!]=?|\+[=+]?|-[>=-]?|\|[=|]?|>[=>]?|&lt;(&lt;|[=-])?|==?|&amp;(&amp;|=|^=?)?|\.(\.\.)?|[,;]|:=?)/g,
  'number': /\b(-?(0x[a-f\d]+|(\d+\.?\d*|\.\d+)(e[-+]?\d+)?)i?)\b/ig,
  'string': /("|'|`)(\\?.|\r|\n)*?\1/g
});
delete Prism.languages.go['class-name'];
;
(function(){

if(!window.Prism) {
  return;
}

function $$(expr, con) {
  return Array.prototype.slice.call((con || document).querySelectorAll(expr));
}

function hasClass(element, className) {
  className = " " + className + " ";
  return (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1
}

var CRLF = crlf = /\r?\n|\r/g;
    
function highlightLines(pre, lines, classes) {
  var ranges = lines.replace(/\s+/g, '').split(','),
      offset = +pre.getAttribute('data-line-offset') || 0;
  
  var lineHeight = parseFloat(getComputedStyle(pre).lineHeight);

  for (var i=0, range; range = ranges[i++];) {
    range = range.split('-');
          
    var start = +range[0],
        end = +range[1] || start;
    
    var line = document.createElement('div');
    
    line.textContent = Array(end - start + 2).join(' \r\n');
    line.className = (classes || '') + ' line-highlight';

    //if the line-numbers plugin is enabled, then there is no reason for this plugin to display the line numbers
    if(!hasClass(pre, 'line-numbers')) {
      line.setAttribute('data-start', start);

      if(end > start) {
        line.setAttribute('data-end', end);
      }
    }

    line.style.top = (start - offset - 1) * lineHeight + 'px';

    //allow this to play nicely with the line-numbers plugin
    if(hasClass(pre, 'line-numbers')) {
      //need to attack to pre as when line-numbers is enabled, the code tag is relatively which screws up the positioning
      pre.appendChild(line);
    } else {
      (pre.querySelector('code') || pre).appendChild(line);
    }
  }
}

function applyHash() {
  var hash = location.hash.slice(1);
  
  // Remove pre-existing temporary lines
  $$('.temporary.line-highlight').forEach(function (line) {
    line.parentNode.removeChild(line);
  });
  
  var range = (hash.match(/\.([\d,-]+)$/) || [,''])[1];
  
  if (!range || document.getElementById(hash)) {
    return;
  }
  
  var id = hash.slice(0, hash.lastIndexOf('.')),
      pre = document.getElementById(id);
      
  if (!pre) {
    return;
  }
  
  if (!pre.hasAttribute('data-line')) {
    pre.setAttribute('data-line', '');
  }

  highlightLines(pre, range, 'temporary ');

  document.querySelector('.temporary.line-highlight').scrollIntoView();
}

var fakeTimer = 0; // Hack to limit the number of times applyHash() runs

Prism.hooks.add('after-highlight', function(env) {
  var pre = env.element.parentNode;
  var lines = pre && pre.getAttribute('data-line');
  
  if (!pre || !lines || !/pre/i.test(pre.nodeName)) {
    return;
  }
  
  clearTimeout(fakeTimer);
  
  $$('.line-highlight', pre).forEach(function (line) {
    line.parentNode.removeChild(line);
  });
  
  highlightLines(pre, lines);
  
  fakeTimer = setTimeout(applyHash, 1);
});

addEventListener('hashchange', applyHash);

})();
;
Prism.hooks.add('after-highlight', function (env) {
  // works only for <code> wrapped inside <pre data-line-numbers> (not inline)
  var pre = env.element.parentNode;
  if (!pre || !/pre/i.test(pre.nodeName) || pre.className.indexOf('line-numbers') === -1) {
    return;
  }

  // old
  // var linesNum = (1 + env.code.split('\n').length);

  // new
  var linesNum;
  var lineArr = env.code.split('\n');
  if( lineArr[ lineArr.length-1 ] === '' ){
    linesNum = lineArr.length;
  }
  else{
    linesNum = lineArr.length+1;
  }

  var lineNumbersWrapper;

  lines = new Array(linesNum);
  lines = lines.join('<span></span>');

  lineNumbersWrapper = document.createElement('span');
  lineNumbersWrapper.className = 'line-numbers-rows';
  lineNumbersWrapper.innerHTML = lines;

  if (pre.hasAttribute('data-start')) {
    pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
  }

  env.element.appendChild(lineNumbersWrapper);

});;
(function(){

if (!self.Prism) {
  return;
}

var url = /\b([a-z]{3,7}:\/\/|tel:)[\w-+%~/.:#=?&amp;]+/,
    email = /\b\S+@[\w.]+[a-z]{2}/,
    linkMd = /\[([^\]]+)]\(([^)]+)\)/,
    
  // Tokens that may contain URLs and emails
    candidates = ['comment', 'url', 'attr-value', 'string'];

for (var language in Prism.languages) {
  var tokens = Prism.languages[language];
  
  Prism.languages.DFS(tokens, function (type, def) {
    if (candidates.indexOf(type) > -1) {
      if (!def.pattern) {
        def = this[type] = {
          pattern: def
        };
      }
      
      def.inside = def.inside || {};
      
      if (type == 'comment') {
        def.inside['md-link'] = linkMd;
      }
      if (type == 'attr-value') {
        Prism.languages.insertBefore('inside', 'punctuation', { 'url-link': url }, def);
      }
      else {
        def.inside['url-link'] = url;
      }
      
      def.inside['email-link'] = email;
    }
  });
  
  tokens['url-link'] = url;
  tokens['email-link'] = email;
}

Prism.hooks.add('wrap', function(env) {
  if (/-link$/.test(env.type)) {
    env.tag = 'a';
    
    var href = env.content;
    
    if (env.type == 'email-link' && href.indexOf('mailto:') != 0) {
      href = 'mailto:' + href;
    }
    else if (env.type == 'md-link') {
      // Markdown
      var match = env.content.match(linkMd);
      
      href = match[2];
      env.content = match[1];
    }
    
    env.attributes.href = href;
  }
});

})();
;
(function(){

if (!self.Prism || !self.document || !document.querySelector) {
  return;
}

var Extensions = {
  'js': 'javascript',
  'html': 'markup',
  'svg': 'markup'
};

Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function(pre) {
  var src = pre.getAttribute('data-src');
  var extension = (src.match(/\.(\w+)$/) || [,''])[1];
  var language = Extensions[extension] || extension;
  
  var code = document.createElement('code');
  code.className = 'language-' + language;
  
  pre.textContent = '';
  
  code.textContent = 'Loading…';
  
  pre.appendChild(code);
  
  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', src, true);

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      
      if (xhr.status < 400 && xhr.responseText) {
        code.textContent = xhr.responseText;
      
        Prism.highlightElement(code);
      }
      else if (xhr.status >= 400) {
        code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
      }
      else {
        code.textContent = '✖ Error: File does not exist or is empty';
      }
    }
  };
  
  xhr.send(null);
});

})();;
