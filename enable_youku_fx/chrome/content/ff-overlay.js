//var ip_addr  = "166.111.";
//ip_addr += Math.floor(Math.random() * 255);
//ip_addr += '.';
//ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254
//var RE_URL_TO_MODIFY = /http:\/\/(\w*\.(youku|tudou|letv\.tudou|letv|xiami)\.com\w*)/;
var RE_URL_TO_MODIFY_1 = /http:\/\/*\.(xiami|ku6)\.com*/;
var RE_URL_TO_MODIFY_2 = /http:\/\/(hot\.vrs\.sohu|hot\.vrs\.letv|data\.video\.qiyi|vv\.video\.qq|geo\.js\.kankan\.xunlei|v2\.tudou|web\-play\.pptv|dyn\.ugc\.pps|s\.plcloud\.music\.qq|inner\.kandian|ipservice\.163|v\.iask|v\.youku)\.(com|tv)*/;

var TOPIC_MODIFY_REQUEST = "http-on-modify-request";


var unblock_youku = {};  // namespace


var youkuObserver = {  
	register: function() {  
	var observerService = Components.classes["@mozilla.org/observer-service;1"]  
						  .getService(Components.interfaces.nsIObserverService);  
	observerService.addObserver(this, TOPIC_MODIFY_REQUEST, false);  
	}, 
	observe : function(aSubject, aTopic, aData) {
	  if (TOPIC_MODIFY_REQUEST == aTopic) {
		var url;
		aSubject.QueryInterface(Components.interfaces.nsIHttpChannel);
		url = aSubject.URI.spec;
		if (RE_URL_TO_MODIFY_1.test(url)) { // RE_URL_TO_MODIFY is a regular expression.
		  aSubject.setRequestHeader("X-Forwarded-For", unblock_youku.ip_addr, false);
		} else if (RE_URL_TO_MODIFY_2.test(url)) {
		  var timestamp = Math.round(window.mozAnimationStartTime / 1000).toString(16);
		  var target_host = url.match(/:\/\/(.[^\/]+)/)[1];
		  var tag = compute_sogou_tag(timestamp + target_host + 'SogouExplorerProxy');
		  aSubject.setRequestHeader("X-Forwarded-For", unblock_youku.ip_addr, false);
		  aSubject.setRequestHeader("X-Sogou-Auth", unblock_youku.sogou_auth, false);
		  aSubject.setRequestHeader("X-Sogou-Timestamp", timestamp, false);
		  aSubject.setRequestHeader("X-Sogou-Tag", tag, false);
		  aSubject.setRequestHeader("X-Real-IP", unblock_youku.ip_addr, false);
		}
	  }
	},
	unregister: function() {  
	var observerService = Components.classes["@mozilla.org/observer-service;1"]  
							.getService(Components.interfaces.nsIObserverService);  
	observerService.removeObserver(this, "http-on-modify-request");  
	} 

}  


var youkuenabler = {
  onLoad: function() {
  	var gPref = Components.classes["@mozilla.org/preferences-service;1"]
               .getService(Components.interfaces.nsIPrefService)
               .QueryInterface(Components.interfaces.nsIPrefBranch2);	
	if (!gPref.getBoolPref("extensions.youkuenabler.firstrun")) {
		gPref.setIntPref("network.proxy.type", 2);
		gPref.setCharPref("network.proxy.autoconfig_url", "http://youku-enable-fx.googlecode.com/files/youku_enable.pac");
		gPref.setBoolPref("extensions.youkuenabler.firstrun", true);
	}
	if (gPref.getBoolPref("extensions.youkuenabler.enable")) {
		youkuObserver.register();
	}
  },
};


	
	
// based on http://xiaoxia.org/2011/03/10/depressed-research-about-sogou-proxy-server-authentication-protocol/
function compute_sogou_tag(s) {
    var total_len = s.length;
    var numb_iter = Math.floor(total_len / 4);
    var numb_left = total_len % 4;

    var hash = total_len;  // output hash tag

    for (var i = 0; i < numb_iter; i++) {
        low  = s.charCodeAt(4 * i + 1) * 256 + s.charCodeAt(4 * i);  // right most 16 bits in little-endian
        high = s.charCodeAt(4 * i + 3) * 256 + s.charCodeAt(4 * i + 2);  // left most

        hash += low;
        hash %= 0x100000000;
        hash ^= hash << 16;

        hash ^= high << 11;
        hash += hash >>> 11;
        hash %= 0x100000000;
    }

    switch (numb_left) {
    case 3:
        hash += (s.charCodeAt(total_len - 2) << 8) + s.charCodeAt(total_len - 3);
        hash %= 0x100000000;
        hash ^= hash << 16;
        hash ^= s.charCodeAt(total_len - 1) << 18;
        hash += hash >>> 11;
        hash %= 0x100000000;
        break;
    case 2:
        hash += (s.charCodeAt(total_len - 1) << 8) + s.charCodeAt(total_len - 2);
        hash %= 0x100000000;
        hash ^= hash << 11;
        hash += hash >>> 17;
        hash %= 0x100000000;
        break;
    case 1:
        hash += s.charCodeAt(total_len - 1);
        hash %= 0x100000000;
        hash ^= hash << 10;
        hash += hash >>> 1;
        hash %= 0x100000000;
        break;
    default:
        break;
    }

    hash ^= hash << 3;
    hash += hash >>> 5;
    hash %= 0x100000000;

    hash ^= hash << 4;
    hash += hash >>> 17;
    hash %= 0x100000000;

    hash ^= hash << 25;
    hash += hash >>> 6;
    hash %= 0x100000000;

    // learnt from http://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
    hash = hash >>> 0;

    return ('00000000' + hash.toString(16)).slice(-8);
}

window.addEventListener("load", function () {
    unblock_youku.ip_addr  = '220.181.111.';
    unblock_youku.ip_addr += Math.floor(Math.random() * 254 + 1); // 1 ~ 254

    unblock_youku.sogou_auth = '/30/853edc6d49ba4e27';
    var tmp_str;
    for (var i = 0; i < 8; i++) {
        tmp_str = ('0000' + Math.floor(Math.random() * 65536).toString(16)).slice(-4);
        unblock_youku.sogou_auth = tmp_str.toUpperCase() + unblock_youku.sogou_auth;
    }
	youkuenabler.onLoad();}, false);