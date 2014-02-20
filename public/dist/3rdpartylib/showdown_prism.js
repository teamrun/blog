var Showdown={};Showdown.converter=function(){var e,n,r,t=0;this.makeHtml=function(t){return e=new Array,n=new Array,r=new Array,t=t.replace(/~/g,"~T"),t=t.replace(/\$/g,"~D"),t=t.replace(/\r\n/g,"\n"),t=t.replace(/\r/g,"\n"),t="\n\n"+t+"\n\n",t=E(t),t=t.replace(/^[ \t]+$/gm,""),t=l(t),t=i(t),t=c(t),t=C(t),t=t.replace(/~D/g,"$$"),t=t.replace(/~T/g,"~")};var a,i=function(r){var r=r.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,function(r,t,a,i,l){return t=t.toLowerCase(),e[t]=A(a),i?i+l:(l&&(n[t]=l.replace(/"/g,"&quot;")),"")});return r},l=function(e){e=e.replace(/\n/g,"\n\n");return e=e.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,o),e=e.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,o),e=e.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,o),e=e.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,o),e=e.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,o),e=e.replace(/\n\n/g,"\n")},o=function(e,n){var t=n;return t=t.replace(/\n\n/g,"\n"),t=t.replace(/^\n/,""),t=t.replace(/\n+$/g,""),t="\n\n~K"+(r.push(t)-1)+"K\n\n"},c=function(e){e=m(e);var n=w("<hr />");return e=e.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,n),e=e.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,n),e=e.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,n),e=h(e),e=v(e),e=$(e),e=l(e),e=x(e)},s=function(e){return e=b(e),e=g(e),e=P(e),e=f(e),e=u(e),e=S(e),e=A(e),e=k(e),e=e.replace(/  +\n/g," <br />\n")},g=function(e){var n=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;return e=e.replace(n,function(e){var n=e.replace(/(.)<\/?code>(?=.)/g,"$1`");return n=N(n,"\\`*_")})},u=function(e){return e=e.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,p),e=e.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,p),e=e.replace(/(\[([^\[\]]+)\])()()()()()/g,p)},p=function(r,t,a,i,l,o,c,s){void 0==s&&(s="");var g=t,u=a,p=i.toLowerCase(),f=l,d=s;if(""==f)if(""==p&&(p=u.toLowerCase().replace(/ ?\n/g," ")),f="#"+p,void 0!=e[p])f=e[p],void 0!=n[p]&&(d=n[p]);else{if(!(g.search(/\(\s*\)$/m)>-1))return g;f=""}f=N(f,"*_");var m='<a href="'+f+'"';return""!=d&&(d=d.replace(/"/g,"&quot;"),d=N(d,"*_"),m+=' title="'+d+'"'),m+=">"+u+"</a>"},f=function(e){return e=e.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,d),e=e.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,d)},d=function(r,t,a,i,l,o,c,s){var g=t,u=a,p=i.toLowerCase(),f=l,d=s;if(d||(d=""),""==f){if(""==p&&(p=u.toLowerCase().replace(/ ?\n/g," ")),f="#"+p,void 0==e[p])return g;f=e[p],void 0!=n[p]&&(d=n[p])}u=u.replace(/"/g,"&quot;"),f=N(f,"*_");var m='<img src="'+f+'" alt="'+u+'"';return d=d.replace(/"/g,"&quot;"),d=N(d,"*_"),m+=' title="'+d+'"',m+=" />"},m=function(e){function n(e){return e.replace(/[^\w]/g,"").toLowerCase()}return e=e.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,function(e,r){return w('<h1 id="'+n(r)+'">'+s(r)+"</h1>")}),e=e.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(e,r){return w('<h2 id="'+n(r)+'">'+s(r)+"</h2>")}),e=e.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(e,r,t){var a=r.length;return w("<h"+a+' id="'+n(t)+'">'+s(t)+"</h"+a+">")})},h=function(e){e+="~0";var n=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;return t?e=e.replace(n,function(e,n,r){var t=n,i=r.search(/[*+-]/g)>-1?"ul":"ol";t=t.replace(/\n{2,}/g,"\n\n\n");var l=a(t);return l=l.replace(/\s+$/,""),l="<"+i+">"+l+"</"+i+">\n"}):(n=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g,e=e.replace(n,function(e,n,r,t){var i=n,l=r,o=t.search(/[*+-]/g)>-1?"ul":"ol",l=l.replace(/\n{2,}/g,"\n\n\n"),c=a(l);return c=i+"<"+o+">\n"+c+"</"+o+">\n"})),e=e.replace(/~0/,"")};a=function(e){return t++,e=e.replace(/\n{2,}$/,"\n"),e+="~0",e=e.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,function(e,n,r,t,a){var i=a,l=n;return l||i.search(/\n{2,}/)>-1?i=c(_(i)):(i=h(_(i)),i=i.replace(/\n$/,""),i=s(i)),"<li>"+i+"</li>\n"}),e=e.replace(/~0/g,""),t--,e};var v=function(e){return e+="~0",e=e.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,function(e,n,r){var t=n,a=r;return t=y(_(t)),t=E(t),t=t.replace(/^\n+/g,""),t=t.replace(/\n+$/g,""),t="<pre><code>"+t+"\n</code></pre>",w(t)+a}),e=e.replace(/~0/,"")},w=function(e){return e=e.replace(/(^\n+|\n+$)/g,""),"\n\n~K"+(r.push(e)-1)+"K\n\n"},b=function(e){return e=e.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(e,n,r,t){var a=t;return a=a.replace(/^([ \t]*)/g,""),a=a.replace(/[ \t]*$/g,""),a=y(a),n+"<code>"+a+"</code>"})},y=function(e){return e=e.replace(/&/g,"&amp;"),e=e.replace(/</g,"&lt;"),e=e.replace(/>/g,"&gt;"),e=N(e,"*_{}[]\\",!1)},k=function(e){return e=e.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,"<strong>$2</strong>"),e=e.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,"<em>$2</em>")},$=function(e){return e=e.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(e,n){var r=n;return r=r.replace(/^[ \t]*>[ \t]?/gm,"~0"),r=r.replace(/~0/g,""),r=r.replace(/^[ \t]+$/gm,""),r=c(r),r=r.replace(/(^|\n)/g,"$1  "),r=r.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(e,n){var r=n;return r=r.replace(/^  /gm,"~0"),r=r.replace(/~0/g,"")}),w("<blockquote>\n"+r+"\n</blockquote>")})},x=function(e){e=e.replace(/^\n+/g,""),e=e.replace(/\n+$/g,"");for(var n=e.split(/\n{2,}/g),t=new Array,a=n.length,i=0;a>i;i++){var l=n[i];l.search(/~K(\d+)K/g)>=0?t.push(l):l.search(/\S/)>=0&&(l=s(l),l=l.replace(/^([ \t]*)/g,"<p>"),l+="</p>",t.push(l))}a=t.length;for(var i=0;a>i;i++)for(;t[i].search(/~K(\d+)K/)>=0;){var o=r[RegExp.$1];o=o.replace(/\$/g,"$$$$"),t[i]=t[i].replace(/~K\d+K/,o)}return t.join("\n\n")},A=function(e){return e=e.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"),e=e.replace(/<(?![a-z\/?\$!])/gi,"&lt;")},P=function(e){return e=e.replace(/\\(\\)/g,T),e=e.replace(/\\([`*_{}\[\]()>#+-.!])/g,T)},S=function(e){return e=e.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,'<a href="$1">$1</a>'),e=e.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,function(e,n){return z(C(n))})},z=function(e){function n(e){var n="0123456789ABCDEF",r=e.charCodeAt(0);return n.charAt(r>>4)+n.charAt(15&r)}var r=[function(e){return"&#"+e.charCodeAt(0)+";"},function(e){return"&#x"+n(e)+";"},function(e){return e}];return e="mailto:"+e,e=e.replace(/./g,function(e){if("@"==e)e=r[Math.floor(2*Math.random())](e);else if(":"!=e){var n=Math.random();e=n>.9?r[2](e):n>.45?r[1](e):r[0](e)}return e}),e='<a href="'+e+'">'+e+"</a>",e=e.replace(/">.+:/g,'">')},C=function(e){return e=e.replace(/~E(\d+)E/g,function(e,n){var r=parseInt(n);return String.fromCharCode(r)})},_=function(e){return e=e.replace(/^(\t|[ ]{1,4})/gm,"~0"),e=e.replace(/~0/g,"")},E=function(e){return e=e.replace(/\t(?=\t)/g,"    "),e=e.replace(/\t/g,"~A~B"),e=e.replace(/~B(.+?)~A/g,function(e,n){for(var r=n,t=4-r.length%4,a=0;t>a;a++)r+=" ";return r}),e=e.replace(/~A/g,"    "),e=e.replace(/~B/g,"")},N=function(e,n,r){var t="(["+n.replace(/([\[\]\\])/g,"\\$1")+"])";r&&(t="\\\\"+t);var a=new RegExp(t,"g");return e=e.replace(a,T)},T=function(e,n){var r=n.charCodeAt(0);return"~E"+r+"E"}},"undefined"!=typeof exports&&(exports.Showdown=Showdown),function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,n=self.Prism={util:{type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var r=n.util.type(e);switch(r){case"Object":var t={};for(var a in e)e.hasOwnProperty(a)&&(t[a]=n.util.clone(e[a]));return t;case"Array":return e.slice()}return e}},languages:{extend:function(e,r){var t=n.util.clone(n.languages[e]);for(var a in r)t[a]=r[a];return t},insertBefore:function(e,r,t,a){a=a||n.languages;var i=a[e],l={};for(var o in i)if(i.hasOwnProperty(o)){if(o==r)for(var c in t)t.hasOwnProperty(c)&&(l[c]=t[c]);l[o]=i[o]}return a[e]=l},DFS:function(e,r){for(var t in e)r.call(e,t,e[t]),"Object"===n.util.type(e)&&n.languages.DFS(e[t],r)}},highlightAll:function(e,r){for(var t,a=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'),i=0;t=a[i++];)n.highlightElement(t,e===!0,r)},highlightRenderedMDPage:function(e,r){for(var t,a=document.querySelectorAll("pre code"),i=0;t=a[i++];){var l=/[\$|```]/g,o=new RegExp("[$|```].+[$|```]"),c=t.innerText.match(o)[0];t.innerText=t.innerText.replace(/[\$|```].+[\$|```]\n+/,""),t.className="language-"+c.replace(l,""),n.highlightElement(t,e===!0,r)}},highlightElement:function(t,a,i){for(var l,o,c=t;c&&!e.test(c.className);)c=c.parentNode;if(c&&(l=(c.className.match(e)||[,""])[1],o=n.languages[l]),o){t.className=t.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,c=t.parentNode,/pre/i.test(c.nodeName)&&(c.className=c.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var s=t.textContent;if(s){s=s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ");var g={element:t,language:l,grammar:o,code:s};if(n.hooks.run("before-highlight",g),a&&self.Worker){var u=new Worker(n.filename);u.onmessage=function(e){g.highlightedCode=r.stringify(JSON.parse(e.data),l),n.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,i&&i.call(g.element),n.hooks.run("after-highlight",g)},u.postMessage(JSON.stringify({language:g.language,code:g.code}))}else g.highlightedCode=n.highlight(g.code,g.grammar,g.language),n.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,i&&i.call(t),n.hooks.run("after-highlight",g)}}},highlight:function(e,t,a){return r.stringify(n.tokenize(e,t),a)},tokenize:function(e,r){var t=n.Token,a=[e],i=r.rest;if(i){for(var l in i)r[l]=i[l];delete r.rest}e:for(var l in r)if(r.hasOwnProperty(l)&&r[l]){var o=r[l],c=o.inside,s=!!o.lookbehind,g=0;o=o.pattern||o;for(var u=0;u<a.length;u++){var p=a[u];if(a.length>e.length)break e;if(!(p instanceof t)){o.lastIndex=0;var f=o.exec(p);if(f){s&&(g=f[1].length);var d=f.index-1+g,f=f[0].slice(g),m=f.length,h=d+m,v=p.slice(0,d+1),w=p.slice(h+1),b=[u,1];v&&b.push(v);var y=new t(l,c?n.tokenize(f,c):f);b.push(y),w&&b.push(w),Array.prototype.splice.apply(a,b)}}}}return a},hooks:{all:{},add:function(e,r){var t=n.hooks.all;t[e]=t[e]||[],t[e].push(r)},run:function(e,r){var t=n.hooks.all[e];if(t&&t.length)for(var a,i=0;a=t[i++];)a(r)}}},r=n.Token=function(e,n){this.type=e,this.content=n};if(r.stringify=function(e,t,a){if("string"==typeof e)return e;if("[object Array]"==Object.prototype.toString.call(e))return e.map(function(n){return r.stringify(n,t,e)}).join("");var i={type:e.type,content:r.stringify(e.content,t,a),tag:"span",classes:["token",e.type],attributes:{},language:t,parent:a};"comment"==i.type&&(i.attributes.spellcheck="true"),n.hooks.run("wrap",i);var l="";for(var o in i.attributes)l+=o+'="'+(i.attributes[o]||"")+'"';return"<"+i.tag+' class="'+i.classes.join(" ")+'" '+l+">"+i.content+"</"+i.tag+">"},!self.document)return void self.addEventListener("message",function(e){var r=JSON.parse(e.data),t=r.language,a=r.code;self.postMessage(JSON.stringify(n.tokenize(a,n.languages[t]))),self.close()},!1);var t=document.getElementsByTagName("script");t=t[t.length-1],t&&(n.filename=t.src,document.addEventListener&&!t.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",n.highlightRenderedMDPage))}(),Prism.languages.markup={comment:/&lt;!--[\w\W]*?-->/g,prolog:/&lt;\?.+?\?>/,doctype:/&lt;!DOCTYPE.+?>/,cdata:/&lt;!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^&lt;\/?[\w:-]+/i,inside:{punctuation:/^&lt;\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/&amp;#?[\da-z]{1,8};/gi},Prism.hooks.add("wrap",function(e){"entity"===e.type&&(e.attributes.title=e.content.replace(/&amp;/,"&"))}),Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/gi,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,ignore:/&(lt|gt|amp);/gi,punctuation:/[\{\};:]/g},Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{style:{pattern:/(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/gi,inside:{tag:{pattern:/(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css}}}),Prism.languages.css.selector={pattern:/[^\{\}\s][^\{\}]*(?=\s*\{)/g,inside:{"pseudo-element":/:(?:after|before|first-letter|first-line|selection)|::[-\w]+/g,"pseudo-class":/:[-\w]+(?:\(.*\))?/g,"class":/\.[-:\.\w]+/g,id:/#[-:\.\w]+/g}},Prism.languages.insertBefore("css","ignore",{hexcode:/#[\da-f]{3,6}/gi,entity:/\\[\da-f]{1,8}/gi,number:/[\d%\.]+/g,"function":/(attr|calc|cross-fade|cycle|element|hsla?|image|lang|linear-gradient|matrix3d|matrix|perspective|radial-gradient|repeating-linear-gradient|repeating-radial-gradient|rgba?|rotatex|rotatey|rotatez|rotate3d|rotate|scalex|scaley|scalez|scale3d|scale|skewx|skewy|skew|steps|translatex|translatey|translatez|translate3d|translate|url|var)/gi}),Prism.languages.clike={comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])\/\/.*?(\r?\n|$))/g,lookbehind:!0},string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/gi,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/gi,inside:{punctuation:/\(/}},number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|&lt;=?|>=?|={1,3}|(&amp;){1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g},Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(var|let|if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|throw|catch|finally|null|break|continue)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/gi,inside:{tag:{pattern:/(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/gi,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript}}}),Prism.languages.coffeescript=Prism.languages.extend("javascript",{"block-comment":/([#]{3}\s*\r?\n(.*\s*\r*\n*)\s*?\r?\n[#]{3})/g,comment:/(\s|^)([#]{1}[^#^\r^\n]{2,}?(\r?\n|$))/g,keyword:/\b(this|window|delete|class|extends|namespace|extend|ar|let|if|else|while|do|for|each|of|return|in|instanceof|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/g}),Prism.languages.insertBefore("coffeescript","keyword",{"function":{pattern:/[a-z|A-z]+\s*[:|=]\s*(\([.|a-z\s|,|:|{|}|\"|\'|=]*\))?\s*-&gt;/gi,inside:{"function-name":/[_?a-z-|A-Z-]+(\s*[:|=])| @[_?$?a-z-|A-Z-]+(\s*)| /g,operator:/[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g}},"attr-name":/[_?a-z-|A-Z-]+(\s*:)| @[_?$?a-z-|A-Z-]+(\s*)| /g}),Prism.languages.python={comment:{pattern:/(^|[^\\])#.*?(\r?\n|$)/g,lookbehind:!0},string:/("|')(\\?.)*?\1/g,keyword:/\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,"boolean":/\b(True|False)\b/g,number:/\b-?(0x)?\d*\.?[\da-f]+\b/g,operator:/[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g},Prism.languages.ruby=Prism.languages.extend("clike",{comment:/#[^\r\n]*(\r?\n|$)/g,keyword:/\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,builtin:/\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,constant:/\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g}),Prism.languages.insertBefore("ruby","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0},variable:/[@$]+\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,symbol:/:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g});var Converter=new Showdown.converter;