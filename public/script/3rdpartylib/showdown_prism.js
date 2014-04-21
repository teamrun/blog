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




// 实例化showdownjs的转换器,用来处理md2html
var Converter = new Showdown.converter();
// converter.makeHtml( '<img src="http://note.wiz.cn/style/images/weibo/logo.png" />' )





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
          console.log( element.innerHTML );
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

  var linesNum = (1 + env.code.split('\n').length);
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
