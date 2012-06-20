var random_num = Math.floor(Math.random() * (16 + 16));
var proxy_addr;
if (random_num < 16)
	proxy_addr = 'h' + random_num + '.dxt.bj.ie.sogou.com';  // 0 ~ 15
else
	proxy_addr = 'h' + (random_num - 16) + '.edu.bj.ie.sogou.com';  


function FindProxyForURL(url, host) {
	if (host === "hot.vrs.sohu.com"         ||
		host === "hot.vrs.letv.com"         ||
		host === "data.video.qiyi.com"      || 
		host === "vv.video.qq.com" 			||
		host === "geo.js.kankan.xunlei.com" ||
		host === "v2.tudou.com"				||
		host === "web-play.pptv.com"		||
		host === "dyn.ugc.pps.tv" 			||
		host === "s.plcloud.music.qq.com" 	||
		host === "inner.kandian.com"		||
		host === "ipservice.163.com"		||
		shExpMatch(url, "http://v.iask.com/v_play.php*")    ||
		shExpMatch(url, "http://v.youku.com/player/*") 		||
		shExpMatch(url, "http://*.gougou.com/*")
		)
		return ("PROXY " + proxy_addr + ":80");
	else
	return "DRIECT";
}