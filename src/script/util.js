define(function( require, exports, module){
	function qs( param ){
		return document.querySelector( param );
	}
	function qsa( param ){
		return document.querySelectorAll( param );
	}

	var Event = {
		addHandler: function(element, type, handler){
		if (element.addEventListener){
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent){
			element.attachEvent("on" + type, handler);
		} else {
			element["on" + type] = handler;
			}
		},

			getButton: function(event){
			if (document.implementation.hasFeature("MouseEvents", "2.0")){
				return event.button;
			} else {
				switch(event.button){
				case 0:
				case 1:
				case 3:
				case 5:
				case 7:
					return 0;
				case 2:
				case 6:
					return 2;
				case 4: 
					return 1;
				}
			}
		},

		getCharCode: function(event){
			var code = event.which? event.which : event.keyCode;
			return code;
			// if (typeof event.charCode == "number"){
			//     return event.charCode;
			// } else {
			//     return event.keyCode;
			// }
			},

		getClipboardText: function(event){
			var clipboardData =  (event.clipboardData || window.clipboardData);
				return clipboardData.getData("text");
			},

		getEvent: function(event){
			return event ? event : window.event;
			},

		getRelatedTarget: function(event){
			if (event.relatedTarget){
				return event.relatedTarget;
			} else if (event.toElement){
				return event.toElement;
			} else if (event.fromElement){
				return event.fromElement;
			} else {
				return null;
			}
		},

		getTarget: function(event){
			return event.target || event.srcElement;
		},

		getWheelDelta: function(event){
			if (event.wheelDelta){
				return (client.engine.opera && client.engine.opera < 9.5 ? -event.wheelDelta : event.wheelDelta);
			} else {
				return -event.detail * 40;
			}
		},

		preventDefault: function(event){
			if (event.preventDefault){
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		},

		removeHandler: function(element, type, handler){
			if (element.removeEventListener){
				element.removeEventListener(type, handler, false);
			} else if (element.detachEvent){
				element.detachEvent("on" + type, handler);
			} else {
				element["on" + type] = null;
			}
		},

		setClipboardText: function(event, value){
			if (event.clipboardData){
				event.clipboardData.setData("text/plain", value);
			} else if (window.clipboardData){
				window.clipboardData.setData("text", value);
			}
		},

		stopPropagation: function(event){
			if (event.stopPropagation){
				event.stopPropagation();
			} else {
				event.cancelBubble = true;
			}
		},

		trigger: function(element,event){
			if (document.createEventObject){
				// IE浏览器支持fireEvent方法
				var evt = document.createEventObject();
				return element.fireEvent('on'+event,evt);
			}
			else{
				// 其他标准浏览器使用dispatchEvent方法
				var evt = document.createEvent( 'HTMLEvents' );
				// initEvent接受3个参数：
				// 事件类型，是否冒泡，是否阻止浏览器的默认行为
				evt.initEvent(event, true, true);
				return !element.dispatchEvent(evt);
			}
		}

	};

	function hasClass(obj, cls) {
		return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}

	function addClass(obj, cls) {
		if(!this.hasClass(obj, cls)){
			if( obj.className === '' ){
				obj.className += cls;
			}
			else{
				obj.className += ' ' + cls;
			}
		}
	}

	function removeClass(obj, cls) {

		if (hasClass(obj, cls)) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			obj.className = obj.className.replace(reg, '');
		}
	}

	function toggleClass(obj,cls){
		if(hasClass(obj,cls)){
			removeClass(obj, cls);
		}else{
			addClass(obj, cls);
		}
	}

	function replaceClass( obj, replaced, replacer ){
		var classStr = obj.className;
		if( classStr.indexOf( replaced )  >= 0 ){
			obj.className = classStr.replace( replaced, replacer );
		}
		else{
			addClass(obj, replacer);
		}
	}


	function ajaxGet( url, param, callBack){
		var xhr = new XMLHttpRequest();
		url = montageUrl( url , param);
		xhr.open('GET', url);
		xhr.onreadystatechange = function(){
			if( xhr.readyState == 4 && xhr.status == 200){
				try{
					var data = parseObj( xhr.responseText );
					callBack( data );
				}
				catch(err){
					console.log('解析返回数据时发生错误：' + err);
				}
			}
		};
		xhr.send( null );

	}

	function ajaxPost( url, param, callBack ){
		var xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;');
		// xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');  
		// 这样设置header不正确
		xhr.onreadystatechange = function(){
			if( xhr.readyState === 4 ){
				if( xhr.status === 200){
					try{
						// console.log( xhr.getResponseHeader('Content-Type') );

						var data = parseObj( xhr.responseText );
						callBack( data );
					}
					catch(err){
						console.log('解析返回信息时发生错误： ' + err);
					}
				}
				else{

				}
			}
			else{

			}
		};
		var paramStr = '';
		for( var i in param){
			paramStr += i+'='+ param[i]+'&' ;
		}
		paramStr = paramStr.substr(0, paramStr.length - 1);
		xhr.send( paramStr );
	}

	function ajax( opt ){
		var xhr = new XMLHttpRequest();
		var data = '';
		
		if( opt.action.toLowerCase() === 'get' ){
			opt.url = montageUrl( opt.url , opt.data);
			xhr.open( opt.action, opt.url);
		}
		else{
			xhr.open( opt.action, opt.url);
			
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;');
			data = $param( opt.data, data);
			data = data? data : null;
		}

		
		xhr.onreadystatechange = function(){
			if( xhr.readyState == 4 && xhr.status == 200){
				try{
					var result = parseObj( xhr.responseText );
					opt.callback( result );
				}
				catch(err){
					console.log('解析返回数据时发生错误：' + err);
				}
			}
		};
		xhr.send( data );
	}


	function ajaxFail( statusCode ){
		var state = '请求出错，原因是：。。。';
		switch( statusCode ){
			// case ''
		}
		console.log( state );
	}

	function trim( str ){
		if( String.prototype.trim ){
			return str.trim();
		}
		else{
			return trimeForIE( str );
		}

		function trimeForIE( str ){
			return str;
		}
	}



	function addSyntaxHighLight( str ){
		
		var tempArr = str.split('<pre><code>$');
		var codeCount = tempArr.length;
		if( codeCount > 1 ){
			for( var i=0; i+1 < codeCount; i++){
				var languageEnd = tempArr[i+1].indexOf('$');

				var languageType = tempArr[i+1].substr(0, languageEnd );
				tempArr[i] +='<pre class="line-numbers"><code class="language-' + languageType + '">';
				// 剪切字符串  因为有个换行符 所以要多减一个
				tempArr[i+1] = tempArr[i+1].substr( languageEnd+1, tempArr[i+1].length);
				tempArr[i+1] = tempArr[i+1].replace(/\n/,'');
				console.log( i );
			}
		}

		return tempArr.join('');
	}

	function showInfo( type, msg ){
		var toshow, tohide;
	if( type === 0 ){
		tohide = '#info_msg';
		toshow = '#info_err';
	}
	else if( type === 1 ){
		tohide = '#info_err';
		toshow = '#info_suc';
	}

	var ele2show = qs( toshow );
	ele2show.innerHTML = msg ;
	ele2show.style.display = 'block';
	setTimeout( function(){
		ele2show.style.display = 'none';
	}, 5000);

	qs( tohide).style.display = 'none';
	return false;
	}

	// function $param( data, key ){
	// 	var param = '';

	// 	function helper( data ){
	// 		if( data instanceof Array ){
	// 			var len = data.length;
				
	// 		}
	// 		else if( data[key] instanceof Object ){
	// 			for( var j in data[key] ){
	// 				param += key+'['+j+']=' data[key][j] + '&';
	// 			}
	// 		}
	// 	}
	// }


	exports.qs = qs;
	exports.qsa = qsa;

	exports.addClass = addClass;
	exports.hasClass = hasClass;
	exports.removeClass = removeClass;
	exports.toggleClass = toggleClass;
	exports.replaceClass = replaceClass;

	exports.ajaxGet = ajaxGet;
	exports.ajaxPost = ajaxPost;
	exports.ajax = ajax;

	exports.trim = trim;

	exports.Event = Event;


	exports.addSyntaxHighLight = addSyntaxHighLight;
	exports.showInfo = showInfo;


	exports.md5 = hex_md5;

	// 打包暴露接口 ?how?
	// modual.exports = qsa;





	function montageUrl( url, param ){
		var requestUrl = url;
		var separator = '&';
		if( param ){
			if( url.indexOf('?')  < 0){
				separator = '?';
			}

			for( var i in param){
				requestUrl += separator + i + '=' + param[i];
				separator = '&';
			}
		}
		
		return requestUrl;
	}

	function $param( data, pStr, keyName ){
		if( keyName ){
            if( data instanceof Array ){
                var len = data.length;
                for( var j=0; j<len;j++){
                    // 不同于基本对象, 复合对象的pStr不能用+
                    // 因为最终都是只对基本对象做参数字符串的拼接
                    pStr = $param( data[j], pStr, keyName+'[]');
                }
            }
            else if( data instanceof Object){
                for( var i in data ){
                    pStr = $param( data[i], pStr, keyName+'['+i+']');
                }
                // pStr += 
            }
            else if( typeof data ==  'string' || typeof data == 'number' ){
                pStr += keyName + '=' + data + '&';
            }
        }
        else{
            if( data instanceof Object){
                for( var m in data ){
                    console.log( typeof data[m] );
                    if( data[m] instanceof Array ){
                        var len = data[m].length;
                            for( var k=0; k<len;k++){
                                // 不同于基本对象, 复合对象的pStr不能用+
                                pStr = $param( data[m][k], pStr, m+'[]');
                            }
                    }
                    else if( data[m] instanceof Object ){
                        for( var n in data[m] ){
                            pStr = $param( data[m][n], pStr, m +'['+n+']');
                        }
                    }
                    else if( typeof data[m] ==  'string' || typeof data[m] == 'number' ){
                        pStr += m + '=' + data[m] + '&';
                    }

                }
            }
            else{
                return 'not a valid data for ajax';
            }
            
        }        
        pStr = pStr.substr( 0, pStr.length );
        return pStr;
	}

	function parseObj( str ){
		var data;
		try{
			data = JSON.parse( str );
		}
		catch( err ){
			// console.log('使用parse解析返回数据时 出现错误····'+err);
			data = eval('(' + str +')');
		}
		return data;
	}





	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
	var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
	function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
	function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
	function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
	function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
	function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Calculate the HMAC-MD5, of a key and some data
	 */
	function core_hmac_md5(key, data)
	{
	  var bkey = str2binl(key);
	  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
	  return core_md5(opad.concat(hash), 512 + 128);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	/*
	 * Convert a string to an array of little-endian words
	 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
	 */
	function str2binl(str)
	{
	  var bin = Array();
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < str.length * chrsz; i += chrsz)
	    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
	  return bin;
	}

	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2str(bin)
	{
	  var str = "";
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < bin.length * 32; i += chrsz)
	    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
	  return str;
	}

	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	function binl2hex(binarray)
	{
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i++)
	  {
	    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
	           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
	  }
	  return str;
	}

	/*
	 * Convert an array of little-endian words to a base-64 string
	 */
	function binl2b64(binarray)
	{
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3)
	  {
	    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
	                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
	                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
	    for(var j = 0; j < 4; j++)
	    {
	      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
	      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
	    }
	  }
	  return str;
	}

});
