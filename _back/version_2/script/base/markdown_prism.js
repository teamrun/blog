/*--------------------------------------------------------*/
/*
 * @source file: ./showdown.js   http://www.showdown.im/   https://github.com/coreyti/showdown
 * 
 *
 *
 *
 */
/*--------------------------------------------------------*/


var Showdown = {};

Showdown.converter = function() {
var g_urls;
var g_titles;
var g_html_blocks;

// Used to track when we're inside an ordered or unordered list
// (see _ProcessListItems() for details):
var g_list_level = 0;


this.makeHtml = function(text) {
  g_urls = new Array();
  g_titles = new Array();
  g_html_blocks = new Array();

  // attacklab: Replace ~ with ~T
  // This lets us use tilde as an escape char to avoid md5 hashes
  // The choice of character is arbitray; anything that isn't
    // magic in Markdown will work.
  text = text.replace(/~/g,"~T");

  // attacklab: Replace $ with ~D
  // RegExp interprets $ as a special character
  // when it's in a replacement string
  text = text.replace(/\$/g,"~D");

  // Standardize line endings
  text = text.replace(/\r\n/g,"\n"); // DOS to Unix
  text = text.replace(/\r/g,"\n"); // Mac to Unix

  // Make sure text begins and ends with a couple of newlines:
  text = "\n\n" + text + "\n\n";

  // Convert all tabs to spaces.
  text = _Detab(text);

  // Strip any lines consisting only of spaces and tabs.
  // This makes subsequent regexen easier to write, because we can
  // match consecutive blank lines with /\n+/ instead of something
  // contorted like /[ \t]*\n+/ .
  text = text.replace(/^[ \t]+$/mg,"");

  // Turn block-level HTML blocks into hash entries
  text = _HashHTMLBlocks(text);

  // Strip link definitions, store in hashes.
  text = _StripLinkDefinitions(text);

  text = _RunBlockGamut(text);

  text = _UnescapeSpecialChars(text);

  // attacklab: Restore dollar signs
  text = text.replace(/~D/g,"$$");

  // attacklab: Restore tildes
  text = text.replace(/~T/g,"~");

  return text;
}


var _StripLinkDefinitions = function(text) {
//
// Strips link definitions from text, stores the URLs and titles in
// hash references.
//

  // Link defs are in the form: ^[id]: url "optional title"

  /*
    var text = text.replace(/
        ^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
          [ \t]*
          \n?       // maybe *one* newline
          [ \t]*
        <?(\S+?)>?      // url = $2
          [ \t]*
          \n?       // maybe one newline
          [ \t]*
        (?:
          (\n*)       // any lines skipped = $3 attacklab: lookbehind removed
          ["(]
          (.+?)       // title = $4
          [")]
          [ \t]*
        )?          // title is optional
        (?:\n+|$)
        /gm,
        function(){...});
  */
  var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,
    function (wholeMatch,m1,m2,m3,m4) {
      m1 = m1.toLowerCase();
      g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive
      if (m3) {
        // Oops, found blank lines, so it's not a title.
        // Put back the parenthetical statement we stole.
        return m3+m4;
      } else if (m4) {
        g_titles[m1] = m4.replace(/"/g,"&quot;");
      }
      
      // Completely remove the definition from the text
      return "";
    }
  );

  return text;
}


var _HashHTMLBlocks = function(text) {
  // attacklab: Double up blank lines to reduce lookaround
  text = text.replace(/\n/g,"\n\n");

  // Hashify HTML blocks:
  // We only want to do this for block-level HTML tags, such as headers,
  // lists, and tables. That's because we still want to wrap <p>s around
  // "paragraphs" that are wrapped in non-block-level tags, such as anchors,
  // phrase emphasis, and spans. The list of tags we're looking for is
  // hard-coded:
  var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
  var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

  // First, look for nested blocks, e.g.:
  //   <div>
  //     <div>
  //     tags for inner block must be indented.
  //     </div>
  //   </div>
  //
  // The outermost tags must start at the left margin for this to match, and
  // the inner nested divs must be indented.
  // We need to do this before the next, more liberal match, because the next
  // match will start at the first `<div>` and stop at the first `</div>`.

  // attacklab: This regex can be expensive when it fails.
  /*
    var text = text.replace(/
    (           // save in $1
      ^         // start of line  (with /m)
      <($block_tags_a)  // start tag = $2
      \b          // word break
                // attacklab: hack around khtml/pcre bug...
      [^\r]*?\n     // any number of lines, minimally matching
      </\2>       // the matching end tag
      [ \t]*        // trailing spaces/tabs
      (?=\n+)       // followed by a newline
    )           // attacklab: there are sentinel newlines at end of document
    /gm,function(){...}};
  */
  text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);

  //
  // Now match more liberally, simply from `\n<tag>` to `</tag>\n`
  //

  /*
    var text = text.replace(/
    (           // save in $1
      ^         // start of line  (with /m)
      <($block_tags_b)  // start tag = $2
      \b          // word break
                // attacklab: hack around khtml/pcre bug...
      [^\r]*?       // any number of lines, minimally matching
      .*</\2>       // the matching end tag
      [ \t]*        // trailing spaces/tabs
      (?=\n+)       // followed by a newline
    )           // attacklab: there are sentinel newlines at end of document
    /gm,function(){...}};
  */
  text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);

  // Special case just for <hr />. It was easier to make a special case than
  // to make the other regex more complicated.  

  /*
    text = text.replace(/
    (           // save in $1
      \n\n        // Starting after a blank line
      [ ]{0,3}
      (<(hr)        // start tag = $2
      \b          // word break
      ([^<>])*?     // 
      \/?>)       // the matching end tag
      [ \t]*
      (?=\n{2,})      // followed by a blank line
    )
    /g,hashElement);
  */
  text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);

  // Special case for standalone HTML comments:

  /*
    text = text.replace(/
    (           // save in $1
      \n\n        // Starting after a blank line
      [ ]{0,3}      // attacklab: g_tab_width - 1
      <!
      (--[^\r]*?--\s*)+
      >
      [ \t]*
      (?=\n{2,})      // followed by a blank line
    )
    /g,hashElement);
  */
  text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);

  // PHP and ASP-style processor instructions (<?...?> and <%...%>)

  /*
    text = text.replace(/
    (?:
      \n\n        // Starting after a blank line
    )
    (           // save in $1
      [ ]{0,3}      // attacklab: g_tab_width - 1
      (?:
        <([?%])     // $2
        [^\r]*?
        \2>
      )
      [ \t]*
      (?=\n{2,})      // followed by a blank line
    )
    /g,hashElement);
  */
  text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);

  // attacklab: Undo double lines (see comment at top of this function)
  text = text.replace(/\n\n/g,"\n");
  return text;
}

var hashElement = function(wholeMatch,m1) {
  var blockText = m1;

  // Undo double lines
  blockText = blockText.replace(/\n\n/g,"\n");
  blockText = blockText.replace(/^\n/,"");
  
  // strip trailing blank lines
  blockText = blockText.replace(/\n+$/g,"");
  
  // Replace the element text with a marker ("~KxK" where x is its key)
  blockText = "\n\n~K" + (g_html_blocks.push(blockText)-1) + "K\n\n";
  
  return blockText;
};

var _RunBlockGamut = function(text) {
//
// These are all the transformations that form block-level
// tags like paragraphs, headers, and list items.
//
  text = _DoHeaders(text);

  // Do Horizontal Rules:
  var key = hashBlock("<hr />");
  text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
  text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);
  text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);

  text = _DoLists(text);
  text = _DoCodeBlocks(text);
  text = _DoBlockQuotes(text);

  // We already ran _HashHTMLBlocks() before, in Markdown(), but that
  // was to escape raw HTML in the original Markdown source. This time,
  // we're escaping the markup we've just created, so that we don't wrap
  // <p> tags around block-level tags.
  text = _HashHTMLBlocks(text);
  text = _FormParagraphs(text);

  return text;
}


var _RunSpanGamut = function(text) {
//
// These are all the transformations that occur *within* block-level
// tags like paragraphs, headers, and list items.
//

  text = _DoCodeSpans(text);
  text = _EscapeSpecialCharsWithinTagAttributes(text);
  text = _EncodeBackslashEscapes(text);

  // Process anchor and image tags. Images must come first,
  // because ![foo][f] looks like an anchor.
  text = _DoImages(text);
  text = _DoAnchors(text);

  // Make links out of things like `<http://example.com/>`
  // Must come after _DoAnchors(), because you can use < and >
  // delimiters in inline links like [this](<url>).
  text = _DoAutoLinks(text);
  text = _EncodeAmpsAndAngles(text);
  text = _DoItalicsAndBold(text);

  // Do hard breaks:
  text = text.replace(/  +\n/g," <br />\n");

  return text;
}

var _EscapeSpecialCharsWithinTagAttributes = function(text) {
//
// Within tags -- meaning between < and > -- encode [\ ` * _] so they
// don't conflict with their use in Markdown for code, italics and strong.
//

  // Build a regex to find HTML tags and comments.  See Friedl's 
  // "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
  var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

  text = text.replace(regex, function(wholeMatch) {
    var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");
    tag = escapeCharacters(tag,"\\`*_");
    return tag;
  });

  return text;
}

var _DoAnchors = function(text) {
//
// Turn Markdown link shortcuts into XHTML <a> tags.
//
  //
  // First, handle reference-style links: [link text] [id]
  //

  /*
    text = text.replace(/
    (             // wrap whole match in $1
      \[
      (
        (?:
          \[[^\]]*\]    // allow brackets nested one level
          |
          [^\[]     // or anything else
        )*
      )
      \]

      [ ]?          // one optional space
      (?:\n[ ]*)?       // one optional newline followed by spaces

      \[
      (.*?)         // id = $3
      \]
    )()()()()         // pad remaining backreferences
    /g,_DoAnchors_callback);
  */
  text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);

  //
  // Next, inline-style links: [link text](url "optional title")
  //

  /*
    text = text.replace(/
      (           // wrap whole match in $1
        \[
        (
          (?:
            \[[^\]]*\]  // allow brackets nested one level
          |
          [^\[\]]     // or anything else
        )
      )
      \]
      \(            // literal paren
      [ \t]*
      ()            // no id, so leave $3 empty
      <?(.*?)>?       // href = $4
      [ \t]*
      (           // $5
        (['"])        // quote char = $6
        (.*?)       // Title = $7
        \6          // matching quote
        [ \t]*        // ignore any spaces/tabs between closing quote and )
      )?            // title is optional
      \)
    )
    /g,writeAnchorTag);
  */
  text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);

  //
  // Last, handle reference-style shortcuts: [link text]
  // These must come last in case you've also got [link test][1]
  // or [link test](/foo)
  //

  /*
    text = text.replace(/
    (             // wrap whole match in $1
      \[
      ([^\[\]]+)        // link text = $2; can't contain '[' or ']'
      \]
    )()()()()()         // pad rest of backreferences
    /g, writeAnchorTag);
  */
  text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

  return text;
}

var writeAnchorTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
  if (m7 == undefined) m7 = "";
  var whole_match = m1;
  var link_text   = m2;
  var link_id  = m3.toLowerCase();
  var url   = m4;
  var title = m7;
  
  if (url == "") {
    if (link_id == "") {
      // lower-case and turn embedded newlines into spaces
      link_id = link_text.toLowerCase().replace(/ ?\n/g," ");
    }
    url = "#"+link_id;
    
    if (g_urls[link_id] != undefined) {
      url = g_urls[link_id];
      if (g_titles[link_id] != undefined) {
        title = g_titles[link_id];
      }
    }
    else {
      if (whole_match.search(/\(\s*\)$/m)>-1) {
        // Special case for explicit empty url
        url = "";
      } else {
        return whole_match;
      }
    }
  } 
  
  url = escapeCharacters(url,"*_");
  var result = "<a href=\"" + url + "\"";
  
  if (title != "") {
    title = title.replace(/"/g,"&quot;");
    title = escapeCharacters(title,"*_");
    result +=  " title=\"" + title + "\"";
  }
  
  result += ">" + link_text + "</a>";
  
  return result;
}


var _DoImages = function(text) {
//
// Turn Markdown image shortcuts into <img> tags.
//

  //
  // First, handle reference-style labeled images: ![alt text][id]
  //

  /*
    text = text.replace(/
    (           // wrap whole match in $1
      !\[
      (.*?)       // alt text = $2
      \]

      [ ]?        // one optional space
      (?:\n[ ]*)?     // one optional newline followed by spaces

      \[
      (.*?)       // id = $3
      \]
    )()()()()       // pad rest of backreferences
    /g,writeImageTag);
  */
  text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);

  //
  // Next, handle inline images:  ![alt text](url "optional title")
  // Don't forget: encode * and _

  /*
    text = text.replace(/
    (           // wrap whole match in $1
      !\[
      (.*?)       // alt text = $2
      \]
      \s?         // One optional whitespace character
      \(          // literal paren
      [ \t]*
      ()          // no id, so leave $3 empty
      <?(\S+?)>?      // src url = $4
      [ \t]*
      (         // $5
        (['"])      // quote char = $6
        (.*?)     // title = $7
        \6        // matching quote
        [ \t]*
      )?          // title is optional
    \)
    )
    /g,writeImageTag);
  */
  text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);

  return text;
}

var writeImageTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
  var whole_match = m1;
  var alt_text   = m2;
  var link_id  = m3.toLowerCase();
  var url   = m4;
  var title = m7;

  if (!title) title = "";
  
  if (url == "") {
    if (link_id == "") {
      // lower-case and turn embedded newlines into spaces
      link_id = alt_text.toLowerCase().replace(/ ?\n/g," ");
    }
    url = "#"+link_id;
    
    if (g_urls[link_id] != undefined) {
      url = g_urls[link_id];
      if (g_titles[link_id] != undefined) {
        title = g_titles[link_id];
      }
    }
    else {
      return whole_match;
    }
  } 
  
  alt_text = alt_text.replace(/"/g,"&quot;");
  url = escapeCharacters(url,"*_");
  var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

  // attacklab: Markdown.pl adds empty title attributes to images.
  // Replicate this bug.

  //if (title != "") {
    title = title.replace(/"/g,"&quot;");
    title = escapeCharacters(title,"*_");
    result +=  " title=\"" + title + "\"";
  //}
  
  result += " />";
  
  return result;
}


var _DoHeaders = function(text) {

  // Setext-style headers:
  //  Header 1
  //  ========
  //  
  //  Header 2
  //  --------
  //
  text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
    function(wholeMatch,m1){return hashBlock('<h1 id="' + headerId(m1) + '">' + _RunSpanGamut(m1) + "</h1>");});

  text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
    function(matchFound,m1){return hashBlock('<h2 id="' + headerId(m1) + '">' + _RunSpanGamut(m1) + "</h2>");});

  // atx-style headers:
  //  # Header 1
  //  ## Header 2
  //  ## Header 2 with closing hashes ##
  //  ...
  //  ###### Header 6
  //

  /*
    text = text.replace(/
      ^(\#{1,6})        // $1 = string of #'s
      [ \t]*
      (.+?)         // $2 = Header text
      [ \t]*
      \#*           // optional closing #'s (not counted)
      \n+
    /gm, function() {...});
  */

  text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
    function(wholeMatch,m1,m2) {
      var h_level = m1.length;
      return hashBlock("<h" + h_level + ' id="' + headerId(m2) + '">' + _RunSpanGamut(m2) + "</h" + h_level + ">");
    });

  function headerId(m) {
    return m.replace(/[^\w]/g, '').toLowerCase();
  }
  return text;
}

// This declaration keeps Dojo compressor from outputting garbage:
var _ProcessListItems;

var _DoLists = function(text) {
//
// Form HTML ordered (numbered) and unordered (bulleted) lists.
//

  // attacklab: add sentinel to hack around khtml/safari bug:
  // http://bugs.webkit.org/show_bug.cgi?id=11231
  text += "~0";

  // Re-usable pattern to match any entirel ul or ol list:

  /*
    var whole_list = /
    (                 // $1 = whole list
      (               // $2
        [ ]{0,3}          // attacklab: g_tab_width - 1
        ([*+-]|\d+[.])        // $3 = first list item marker
        [ \t]+
      )
      [^\r]+?
      (               // $4
        ~0              // sentinel for workaround; should be $
      |
        \n{2,}
        (?=\S)
        (?!             // Negative lookahead for another list item marker
          [ \t]*
          (?:[*+-]|\d+[.])[ \t]+
        )
      )
    )/g
  */
  var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

  if (g_list_level) {
    text = text.replace(whole_list,function(wholeMatch,m1,m2) {
      var list = m1;
      var list_type = (m2.search(/[*+-]/g)>-1) ? "ul" : "ol";

      // Turn double returns into triple returns, so that we can make a
      // paragraph for the last item in a list, if necessary:
      list = list.replace(/\n{2,}/g,"\n\n\n");;
      var result = _ProcessListItems(list);
  
      // Trim any trailing whitespace, to put the closing `</$list_type>`
      // up on the preceding line, to get it past the current stupid
      // HTML block parser. This is a hack to work around the terrible
      // hack that is the HTML block parser.
      result = result.replace(/\s+$/,"");
      result = "<"+list_type+">" + result + "</"+list_type+">\n";
      return result;
    });
  } else {
    whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
    text = text.replace(whole_list,function(wholeMatch,m1,m2,m3) {
      var runup = m1;
      var list = m2;

      var list_type = (m3.search(/[*+-]/g)>-1) ? "ul" : "ol";
      // Turn double returns into triple returns, so that we can make a
      // paragraph for the last item in a list, if necessary:
      var list = list.replace(/\n{2,}/g,"\n\n\n");;
      var result = _ProcessListItems(list);
      result = runup + "<"+list_type+">\n" + result + "</"+list_type+">\n"; 
      return result;
    });
  }

  // attacklab: strip sentinel
  text = text.replace(/~0/,"");

  return text;
}

_ProcessListItems = function(list_str) {
//
//  Process the contents of a single ordered or unordered list, splitting it
//  into individual list items.
//
  // The $g_list_level global keeps track of when we're inside a list.
  // Each time we enter a list, we increment it; when we leave a list,
  // we decrement. If it's zero, we're not in a list anymore.
  //
  // We do this because when we're not inside a list, we want to treat
  // something like this:
  //
  //    I recommend upgrading to version
  //    8. Oops, now this line is treated
  //    as a sub-list.
  //
  // As a single paragraph, despite the fact that the second line starts
  // with a digit-period-space sequence.
  //
  // Whereas when we're inside a list (or sub-list), that line will be
  // treated as the start of a sub-list. What a kludge, huh? This is
  // an aspect of Markdown's syntax that's hard to parse perfectly
  // without resorting to mind-reading. Perhaps the solution is to
  // change the syntax rules such that sub-lists must start with a
  // starting cardinal number; e.g. "1." or "a.".

  g_list_level++;

  // trim trailing blank lines:
  list_str = list_str.replace(/\n{2,}$/,"\n");

  // attacklab: add sentinel to emulate \z
  list_str += "~0";

  /*
    list_str = list_str.replace(/
      (\n)?             // leading line = $1
      (^[ \t]*)           // leading whitespace = $2
      ([*+-]|\d+[.]) [ \t]+     // list marker = $3
      ([^\r]+?            // list item text   = $4
      (\n{1,2}))
      (?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
    /gm, function(){...});
  */
  list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
    function(wholeMatch,m1,m2,m3,m4){
      var item = m4;
      var leading_line = m1;
      var leading_space = m2;

      if (leading_line || (item.search(/\n{2,}/)>-1)) {
        item = _RunBlockGamut(_Outdent(item));
      }
      else {
        // Recursion for sub-lists:
        item = _DoLists(_Outdent(item));
        item = item.replace(/\n$/,""); // chomp(item)
        item = _RunSpanGamut(item);
      }

      return  "<li>" + item + "</li>\n";
    }
  );

  // attacklab: strip sentinel
  list_str = list_str.replace(/~0/g,"");

  g_list_level--;
  return list_str;
}


var _DoCodeBlocks = function(text) {
//
//  Process Markdown `<pre><code>` blocks.
//  

  /*
    text = text.replace(text,
      /(?:\n\n|^)
      (               // $1 = the code block -- one or more lines, starting with a space/tab
        (?:
          (?:[ ]{4}|\t)     // Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
          .*\n+
        )+
      )
      (\n*[ ]{0,3}[^ \t\n]|(?=~0))  // attacklab: g_tab_width
    /g,function(){...});
  */

  // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += "~0";
  
  text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
    function(wholeMatch,m1,m2) {
      var codeblock = m1;
      var nextChar = m2;
    
      codeblock = _EncodeCode( _Outdent(codeblock));
      codeblock = _Detab(codeblock);
      codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines
      codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace

      codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

      return hashBlock(codeblock) + nextChar;
    }
  );

  // attacklab: strip sentinel
  text = text.replace(/~0/,"");

  return text;
}

var hashBlock = function(text) {
  text = text.replace(/(^\n+|\n+$)/g,"");
  return "\n\n~K" + (g_html_blocks.push(text)-1) + "K\n\n";
}


var _DoCodeSpans = function(text) {
//
//   *  Backtick quotes are used for <code></code> spans.
// 
//   *  You can use multiple backticks as the delimiters if you want to
//   include literal backticks in the code span. So, this input:
//   
//     Just type ``foo `bar` baz`` at the prompt.
//   
//     Will translate to:
//   
//     <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
//   
//  There's no arbitrary limit to the number of backticks you
//  can use as delimters. If you need three consecutive backticks
//  in your code, use four for delimiters, etc.
//
//  *  You can use spaces to get literal backticks at the edges:
//   
//     ... type `` `bar` `` ...
//   
//     Turns to:
//   
//     ... type <code>`bar`</code> ...
//

  /*
    text = text.replace(/
      (^|[^\\])         // Character before opening ` can't be a backslash
      (`+)            // $2 = Opening run of `
      (             // $3 = The code block
        [^\r]*?
        [^`]          // attacklab: work around lack of lookbehind
      )
      \2              // Matching closer
      (?!`)
    /gm, function(){...});
  */

  text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
    function(wholeMatch,m1,m2,m3,m4) {
      var c = m3;
      c = c.replace(/^([ \t]*)/g,""); // leading whitespace
      c = c.replace(/[ \t]*$/g,""); // trailing whitespace
      c = _EncodeCode(c);
      return m1+"<code>"+c+"</code>";
    });

  return text;
}


var _EncodeCode = function(text) {
//
// Encode/escape certain characters inside Markdown code runs.
// The point is that in code, these characters are literals,
// and lose their special Markdown meanings.
//
  // Encode all ampersands; HTML entities are not
  // entities within a Markdown code span.
  text = text.replace(/&/g,"&amp;");

  // Do the angle bracket song and dance:
  text = text.replace(/</g,"&lt;");
  text = text.replace(/>/g,"&gt;");

  // Now, escape characters that are magic in Markdown:
  text = escapeCharacters(text,"\*_{}[]\\",false);

// jj the line above breaks this:
//---

//* Item

//   1. Subitem

//            special char: *
//---

  return text;
}


var _DoItalicsAndBold = function(text) {

  // <strong> must go first:
  text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
    "<strong>$2</strong>");

  text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
    "<em>$2</em>");

  return text;
}


var _DoBlockQuotes = function(text) {

  /*
    text = text.replace(/
    (               // Wrap whole match in $1
      (
        ^[ \t]*>[ \t]?      // '>' at the start of a line
        .+\n          // rest of the first line
        (.+\n)*         // subsequent consecutive lines
        \n*           // blanks
      )+
    )
    /gm, function(){...});
  */

  text = text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,
    function(wholeMatch,m1) {
      var bq = m1;

      // attacklab: hack around Konqueror 3.5.4 bug:
      // "----------bug".replace(/^-/g,"") == "bug"

      bq = bq.replace(/^[ \t]*>[ \t]?/gm,"~0"); // trim one level of quoting

      // attacklab: clean up hack
      bq = bq.replace(/~0/g,"");

      bq = bq.replace(/^[ \t]+$/gm,"");   // trim whitespace-only lines
      bq = _RunBlockGamut(bq);        // recurse
      
      bq = bq.replace(/(^|\n)/g,"$1  ");
      // These leading spaces screw with <pre> content, so we need to fix that:
      bq = bq.replace(
          /(\s*<pre>[^\r]+?<\/pre>)/gm,
        function(wholeMatch,m1) {
          var pre = m1;
          // attacklab: hack around Konqueror 3.5.4 bug:
          pre = pre.replace(/^  /mg,"~0");
          pre = pre.replace(/~0/g,"");
          return pre;
        });
      
      return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
    });
  return text;
}


var _FormParagraphs = function(text) {
//
//  Params:
//    $text - string to process with html <p> tags
//

  // Strip leading and trailing lines:
  text = text.replace(/^\n+/g,"");
  text = text.replace(/\n+$/g,"");

  var grafs = text.split(/\n{2,}/g);
  var grafsOut = new Array();

  //
  // Wrap <p> tags.
  //
  var end = grafs.length;
  for (var i=0; i<end; i++) {
    var str = grafs[i];

    // if this is an HTML marker, copy it
    if (str.search(/~K(\d+)K/g) >= 0) {
      grafsOut.push(str);
    }
    else if (str.search(/\S/) >= 0) {
      str = _RunSpanGamut(str);
      str = str.replace(/^([ \t]*)/g,"<p>");
      str += "</p>"
      grafsOut.push(str);
    }

  }

  //
  // Unhashify HTML blocks
  //
  end = grafsOut.length;
  for (var i=0; i<end; i++) {
    // if this is a marker for an html block...
    while (grafsOut[i].search(/~K(\d+)K/) >= 0) {
      var blockText = g_html_blocks[RegExp.$1];
      blockText = blockText.replace(/\$/g,"$$$$"); // Escape any dollar signs
      grafsOut[i] = grafsOut[i].replace(/~K\d+K/,blockText);
    }
  }

  return grafsOut.join("\n\n");
}


var _EncodeAmpsAndAngles = function(text) {
// Smart processing for ampersands and angle brackets that need to be encoded.
  
  // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
  //   http://bumppo.net/projects/amputator/
  text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");
  
  // Encode naked <'s
  text = text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");
  
  return text;
}


var _EncodeBackslashEscapes = function(text) {
//
//   Parameter:  String.
//   Returns: The string, with after processing the following backslash
//         escape sequences.
//

  // attacklab: The polite way to do this is with the new
  // escapeCharacters() function:
  //
  //  text = escapeCharacters(text,"\\",true);
  //  text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
  //
  // ...but we're sidestepping its use of the (slow) RegExp constructor
  // as an optimization for Firefox.  This function gets called a LOT.

  text = text.replace(/\\(\\)/g,escapeCharacters_callback);
  text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);
  return text;
}


var _DoAutoLinks = function(text) {

  text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");

  // Email addresses: <address@domain.foo>

  /*
    text = text.replace(/
      <
      (?:mailto:)?
      (
        [-.\w]+
        \@
        [-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
      )
      >
    /gi, _DoAutoLinks_callback());
  */
  text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
    function(wholeMatch,m1) {
      return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
    }
  );

  return text;
}


var _EncodeEmailAddress = function(addr) {
//
//  Input: an email address, e.g. "foo@example.com"
//
//  Output: the email address as a mailto link, with each character
//  of the address encoded as either a decimal or hex entity, in
//  the hopes of foiling most address harvesting spam bots. E.g.:
//
//  <a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
//     x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
//     &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
//
//  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
//  mailing list: <http://tinyurl.com/yu7ue>
//

  // attacklab: why can't javascript speak hex?
  function char2hex(ch) {
    var hexDigits = '0123456789ABCDEF';
    var dec = ch.charCodeAt(0);
    return(hexDigits.charAt(dec>>4) + hexDigits.charAt(dec&15));
  }

  var encode = [
    function(ch){return "&#"+ch.charCodeAt(0)+";";},
    function(ch){return "&#x"+char2hex(ch)+";";},
    function(ch){return ch;}
  ];

  addr = "mailto:" + addr;

  addr = addr.replace(/./g, function(ch) {
    if (ch == "@") {
        // this *must* be encoded. I insist.
      ch = encode[Math.floor(Math.random()*2)](ch);
    } else if (ch !=":") {
      // leave ':' alone (to spot mailto: later)
      var r = Math.random();
      // roughly 10% raw, 45% hex, 45% dec
      ch =  (
          r > .9  ? encode[2](ch)   :
          r > .45 ? encode[1](ch)   :
                encode[0](ch)
        );
    }
    return ch;
  });

  addr = "<a href=\"" + addr + "\">" + addr + "</a>";
  addr = addr.replace(/">.+:/g,"\">"); // strip the mailto: from the visible part

  return addr;
}


var _UnescapeSpecialChars = function(text) {
//
// Swap back in all the special characters we've hidden.
//
  text = text.replace(/~E(\d+)E/g,
    function(wholeMatch,m1) {
      var charCodeToReplace = parseInt(m1);
      return String.fromCharCode(charCodeToReplace);
    }
  );
  return text;
}


var _Outdent = function(text) {
//
// Remove one level of line-leading tabs or spaces
//

  // attacklab: hack around Konqueror 3.5.4 bug:
  // "----------bug".replace(/^-/g,"") == "bug"

  text = text.replace(/^(\t|[ ]{1,4})/gm,"~0"); // attacklab: g_tab_width

  // attacklab: clean up hack
  text = text.replace(/~0/g,"")

  return text;
}

var _Detab = function(text) {
// attacklab: Detab's completely rewritten for speed.
// In perl we could fix it by anchoring the regexp with \G.
// In javascript we're less fortunate.

  // expand first n-1 tabs
  text = text.replace(/\t(?=\t)/g,"    "); // attacklab: g_tab_width

  // replace the nth with two sentinels
  text = text.replace(/\t/g,"~A~B");

  // use the sentinel to anchor our regex so it doesn't explode
  text = text.replace(/~B(.+?)~A/g,
    function(wholeMatch,m1,m2) {
      var leadingText = m1;
      var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width

      // there *must* be a better way to do this:
      for (var i=0; i<numSpaces; i++) leadingText+=" ";

      return leadingText;
    }
  );

  // clean up sentinels
  text = text.replace(/~A/g,"    ");  // attacklab: g_tab_width
  text = text.replace(/~B/g,"");

  return text;
}


//
//  attacklab: Utility functions
//


var escapeCharacters = function(text, charsToEscape, afterBackslash) {
  // First we have to escape the escape characters so that
  // we can build a character class out of them
  var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

  if (afterBackslash) {
    regexString = "\\\\" + regexString;
  }

  var regex = new RegExp(regexString,"g");
  text = text.replace(regex,escapeCharacters_callback);

  return text;
}


var escapeCharacters_callback = function(wholeMatch,m1) {
  var charCodeToEscape = m1.charCodeAt(0);
  return "~E"+charCodeToEscape+"E";
}

} // end of Showdown.converter

// export
if (typeof exports != 'undefined') exports.Showdown = Showdown;

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
/*--------------------------------------------------------*/

 (function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=self.Prism={util:{type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var r={};for(var i in e)e.hasOwnProperty(i)&&(r[i]=t.util.clone(e[i]));return r;case"Array":return e.slice()}return e}},languages:{extend:function(e,n){var r=t.util.clone(t.languages[e]);for(var i in n)r[i]=n[i];return r},insertBefore:function(e,n,r,i){i=i||t.languages;var s=i[e],o={};for(var u in s)if(s.hasOwnProperty(u)){if(u==n)for(var a in r)r.hasOwnProperty(a)&&(o[a]=r[a]);o[u]=s[u]}return i[e]=o},DFS:function(e,n){for(var r in e){n.call(e,r,e[r]);t.util.type(e)==="Object"&&t.languages.DFS(e[r],n)}}},highlightAll:function(e,n){var r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');for(var i=0,s;s=r[i++];)t.highlightElement(s,e===!0,n)},highlightElement:function(r,i,s){var o,u,a=r;while(a&&!e.test(a.className))a=a.parentNode;if(a){o=(a.className.match(e)||[,""])[1];u=t.languages[o]}if(!u)return;r.className=r.className.replace(e,"").replace(/\s+/g," ")+" language-"+o;a=r.parentNode;/pre/i.test(a.nodeName)&&(a.className=a.className.replace(e,"").replace(/\s+/g," ")+" language-"+o);var f=r.textContent;if(!f)return;f=f.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ");var l={element:r,language:o,grammar:u,code:f};t.hooks.run("before-highlight",l);if(i&&self.Worker){var c=new Worker(t.filename);c.onmessage=function(e){l.highlightedCode=n.stringify(JSON.parse(e.data),o);t.hooks.run("before-insert",l);l.element.innerHTML=l.highlightedCode;s&&s.call(l.element);t.hooks.run("after-highlight",l)};c.postMessage(JSON.stringify({language:l.language,code:l.code}))}else{l.highlightedCode=t.highlight(l.code,l.grammar,l.language);t.hooks.run("before-insert",l);l.element.innerHTML=l.highlightedCode;s&&s.call(r);t.hooks.run("after-highlight",l)}},highlight:function(e,r,i){return n.stringify(t.tokenize(e,r),i)},tokenize:function(e,n,r){var i=t.Token,s=[e],o=n.rest;if(o){for(var u in o)n[u]=o[u];delete n.rest}e:for(var u in n){if(!n.hasOwnProperty(u)||!n[u])continue;var a=n[u],f=a.inside,l=!!a.lookbehind,c=0;a=a.pattern||a;for(var h=0;h<s.length;h++){var p=s[h];if(s.length>e.length)break e;if(p instanceof i)continue;a.lastIndex=0;var d=a.exec(p);if(d){l&&(c=d[1].length);var v=d.index-1+c,d=d[0].slice(c),m=d.length,g=v+m,y=p.slice(0,v+1),b=p.slice(g+1),w=[h,1];y&&w.push(y);var E=new i(u,f?t.tokenize(d,f):d);w.push(E);b&&w.push(b);Array.prototype.splice.apply(s,w)}}}return s},hooks:{all:{},add:function(e,n){var r=t.hooks.all;r[e]=r[e]||[];r[e].push(n)},run:function(e,n){var r=t.hooks.all[e];if(!r||!r.length)return;for(var i=0,s;s=r[i++];)s(n)}}},n=t.Token=function(e,t){this.type=e;this.content=t};n.stringify=function(e,r,i){if(typeof e=="string")return e;if(Object.prototype.toString.call(e)=="[object Array]")return e.map(function(t){return n.stringify(t,r,e)}).join("");var s={type:e.type,content:n.stringify(e.content,r,i),tag:"span",classes:["token",e.type],attributes:{},language:r,parent:i};s.type=="comment"&&(s.attributes.spellcheck="true");t.hooks.run("wrap",s);var o="";for(var u in s.attributes)o+=u+'="'+(s.attributes[u]||"")+'"';return"<"+s.tag+' class="'+s.classes.join(" ")+'" '+o+">"+s.content+"</"+s.tag+">"};if(!self.document){self.addEventListener("message",function(e){var n=JSON.parse(e.data),r=n.language,i=n.code;self.postMessage(JSON.stringify(t.tokenize(i,t.languages[r])));self.close()},!1);return}var r=document.getElementsByTagName("script");r=r[r.length-1];if(r){t.filename=r.src;document.addEventListener&&!r.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)}})();;
Prism.languages.markup={comment:/&lt;!--[\w\W]*?-->/g,prolog:/&lt;\?.+?\?>/,doctype:/&lt;!DOCTYPE.+?>/,cdata:/&lt;!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/&lt;\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|\w+))?\s*)*\/?>/gi,inside:{tag:{pattern:/^&lt;\/?[\w:-]+/i,inside:{punctuation:/^&lt;\/?/,namespace:/^[\w-]+?:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,inside:{punctuation:/=|>|"/g}},punctuation:/\/?>/g,"attr-name":{pattern:/[\w:-]+/g,inside:{namespace:/^[\w-]+?:/}}}},entity:/&amp;#?[\da-z]{1,8};/gi};Prism.hooks.add("wrap",function(e){e.type==="entity"&&(e.attributes.title=e.content.replace(/&amp;/,"&"))});;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//g,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*{))/gi,inside:{punctuation:/[;:]/g}},url:/url\((["']?).*?\1\)/gi,selector:/[^\{\}\s][^\{\};]*(?=\s*\{)/g,property:/(\b|\B)[\w-]+(?=\s*:)/ig,string:/("|')(\\?.)*?\1/g,important:/\B!important\b/gi,ignore:/&(lt|gt|amp);/gi,punctuation:/[\{\};:]/g};Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{style:{pattern:/(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/ig,inside:{tag:{pattern:/(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/ig,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.css}}});;
Prism.languages.css.selector={pattern:/[^\{\}\s][^\{\}]*(?=\s*\{)/g,inside:{"pseudo-element":/:(?:after|before|first-letter|first-line|selection)|::[-\w]+/g,"pseudo-class":/:[-\w]+(?:\(.*\))?/g,"class":/\.[-:\.\w]+/g,id:/#[-:\.\w]+/g}};Prism.languages.insertBefore("css","ignore",{hexcode:/#[\da-f]{3,6}/gi,entity:/\\[\da-f]{1,8}/gi,number:/[\d%\.]+/g,"function":/(attr|calc|cross-fade|cycle|element|hsla?|image|lang|linear-gradient|matrix3d|matrix|perspective|radial-gradient|repeating-linear-gradient|repeating-radial-gradient|rgba?|rotatex|rotatey|rotatez|rotate3d|rotate|scalex|scaley|scalez|scale3d|scale|skewx|skewy|skew|steps|translatex|translatey|translatez|translate3d|translate|url|var)/ig});;
Prism.languages.clike={comment:{pattern:/(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])\/\/.*?(\r?\n|$))/g,lookbehind:!0},string:/("|')(\\?.)*?\1/g,"class-name":{pattern:/((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,"boolean":/\b(true|false)\b/g,"function":{pattern:/[a-z0-9_]+\(/ig,inside:{punctuation:/\(/}}, number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,operator:/[-+]{1,2}|!|&lt;=?|>=?|={1,3}|(&amp;){1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g};
;
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(var|let|if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|throw|catch|finally|null|break|continue)\b/g,number:/\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g});Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:!0}});Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/ig,inside:{tag:{pattern:/(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/ig,inside:Prism.languages.markup.tag.inside},rest:Prism.languages.javascript}}});
;
Prism.languages.coffeescript=Prism.languages.extend("javascript",{"block-comment":/([#]{3}\s*\r?\n(.*\s*\r*\n*)\s*?\r?\n[#]{3})/g,comment:/(\s|^)([#]{1}[^#^\r^\n]{2,}?(\r?\n|$))/g,keyword:/\b(this|window|delete|class|extends|namespace|extend|ar|let|if|else|while|do|for|each|of|return|in|instanceof|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/g});Prism.languages.insertBefore("coffeescript","keyword",{"function":{pattern:/[a-z|A-z]+\s*[:|=]\s*(\([.|a-z\s|,|:|{|}|\"|\'|=]*\))?\s*-&gt;/gi,inside:{"function-name":/[_?a-z-|A-Z-]+(\s*[:|=])| @[_?$?a-z-|A-Z-]+(\s*)| /g,operator:/[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g}},"attr-name":/[_?a-z-|A-Z-]+(\s*:)| @[_?$?a-z-|A-Z-]+(\s*)| /g});;
Prism.languages.python={comment:{pattern:/(^|[^\\])#.*?(\r?\n|$)/g,lookbehind:!0},string: /("|')(\\?.)*?\1/g,keyword:/\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,boolean:/\b(True|False)\b/g,number:/\b-?(0x)?\d*\.?[\da-f]+\b/g,operator:/[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,ignore:/&(lt|gt|amp);/gi,punctuation:/[{}[\];(),.:]/g};;
Prism.languages.ruby=Prism.languages.extend("clike",{comment:/#[^\r\n]*(\r?\n|$)/g,keyword:/\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,builtin:/\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,constant:/\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g});Prism.languages.insertBefore("ruby","keyword",{regex:{pattern:/(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,lookbehind:true},variable:/[@$&]+\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,symbol:/:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g})
;
(function(){function e(e,t){return Array.prototype.slice.call((t||document).querySelectorAll(e))}function n(e,t,n){var r=t.replace(/\s+/g,"").split(","),i=+e.getAttribute("data-line-offset")||0,s=parseFloat(getComputedStyle(e).lineHeight);for(var o=0,u;u=r[o++];){u=u.split("-");var a=+u[0],f=+u[1]||a,l=document.createElement("div");l.textContent=Array(f-a+2).join(" \r\n");l.className=(n||"")+" line-highlight";l.setAttribute("data-start",a);f>a&&l.setAttribute("data-end",f);l.style.top=(a-i-1)*s+"px";(e.querySelector("code")||e).appendChild(l)}}function r(){var t=location.hash.slice(1);e(".temporary.line-highlight").forEach(function(e){e.parentNode.removeChild(e)});var r=(t.match(/\.([\d,-]+)$/)||[,""])[1];if(!r||document.getElementById(t))return;var i=t.slice(0,t.lastIndexOf(".")),s=document.getElementById(i);if(!s)return;s.hasAttribute("data-line")||s.setAttribute("data-line","");n(s,r,"temporary ");document.querySelector(".temporary.line-highlight").scrollIntoView()}if(!window.Prism)return;var t=crlf=/\r?\n|\r/g,i=0;Prism.hooks.add("after-highlight",function(t){var s=t.element.parentNode,o=s&&s.getAttribute("data-line");if(!s||!o||!/pre/i.test(s.nodeName))return;clearTimeout(i);e(".line-highlight",s).forEach(function(e){e.parentNode.removeChild(e)});n(s,o);i=setTimeout(r,1)});addEventListener("hashchange",r)})();;
Prism.hooks.add("after-highlight",function(e){var t=e.element.parentNode;if(!t||!/pre/i.test(t.nodeName)||t.className.indexOf("line-numbers")===-1){return}var n=1+e.code.split("\n").length;var r;lines=new Array(n);lines=lines.join("<span></span>");r=document.createElement("span");r.className="line-numbers-rows";r.innerHTML=lines;if(t.hasAttribute("data-start")){t.style.counterReset="linenumber "+(parseInt(t.getAttribute("data-start"),10)-1)}e.element.appendChild(r)})
;
(function(){if(!self.Prism||!self.document||!document.querySelector)return;var e={js:"javascript",html:"markup",svg:"markup"};Array.prototype.slice.call(document.querySelectorAll("pre[data-src]")).forEach(function(t){var n=t.getAttribute("data-src"),r=(n.match(/\.(\w+)$/)||[,""])[1],i=e[r]||r,s=document.createElement("code");s.className="language-"+i;t.textContent="";s.textContent="Loading…";t.appendChild(s);var o=new XMLHttpRequest;o.open("GET",n,!0);o.onreadystatechange=function(){if(o.readyState==4)if(o.status<400&&o.responseText){s.textContent=o.responseText;Prism.highlightElement(s)}else o.status>=400?s.textContent="✖ Error "+o.status+" while fetching file: "+o.statusText:s.textContent="✖ Error: File does not exist or is empty"};o.send(null)})})();;


// 实例化showdownjs的转换器,用来处理md2html
var Converter = new Showdown.converter();
// converter.makeHtml( '<img src="http://note.wiz.cn/style/images/weibo/logo.png" />' )