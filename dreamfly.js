var optId = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage("title"),
		"contexts" : ["image"],
		"onclick" : search
	});

function search(info, tab) {
	var url = info.srcUrl;
	if(url.indexOf("alicdn.com")!=-1){
	   	url = url.replace(/.(\d+x\d+).*|.jpg_(\d+x\d+).*/,'.jpg')
	}
	var fName = url.substring(url.lastIndexOf('/') + 1);
	if(!url.startsWith("file")){
	var getxhr = new XMLHttpRequest();
	getxhr.open('GET', url, true);
	getxhr.responseType = 'arraybuffer';
	getxhr.onreadystatechange = function (e) {
		if (getxhr.readyState === 4 && getxhr.status === 200) {
			contentType = getxhr.getResponseHeader('Content-Type');
			if (contentType === 'image/jpeg' || contentType == 'image/png') {
				uploadImage(getxhr.response, tab, fName, contentType);
			} else {
				var blob = new Blob([new Uint8Array(getxhr.response)], {
						type : contentType
					});
				var url = URL.createObjectURL(blob);
				var img = new Image();
				img.onload = function () {

					var canvas = document.createElement("canvas");
					canvas.width = this.width;
					canvas.height = this.height;
					var ctx = canvas.getContext("2d");
					ctx.drawImage(this, 0, 0);
					var imagedata = canvas.toDataURL("image/jpeg");
					imagedata = imagedata.replace(/^data:image\/(png|jpeg);base64,/, "");
					bimageData = base64DecToArr(imagedata).buffer;
					uploadImage(bimageData, tab, fName, "image/jpeg")
				}
				img.src = url;
			}
		} else if (getxhr.readyState === 4 && getxhr.status !== 200) {
			console.log("查询失败 " + xhr.status);
		}
	};
	getxhr.send();

}else{
			chrome.tabs.query({
			  active: true,
			  currentWindow: true
			}, (tabs) => {
			  let message = {
			    //这里的内容就是发送至content-script的内容
			    info: info.srcUrl
			  }
			  chrome.tabs.sendMessage(tabs[0].id, message, res => {
			    console.log('bg=>content')
			    var imagedata = res;
			    imagedata = imagedata.replace(/^data:image\/(png|jpeg);base64,/, "");
				bimageData = base64DecToArr(imagedata).buffer;
				uploadImage(bimageData, tab, fName, "image/jpeg");
			    // alert(res)
			  })
			})
			// alert("由于浏览器安全限制，无法读取本地文件");
			// imageToCanvas(info.srcUrl);
}
}

function uploadImage(img, tab, fName, imgType) {
	var imgLength = img.byteLength;
	var xhr = new XMLHttpRequest();
	var boundary = generateBoundary('s.taobao.com', 16);
	xhr.open('POST', 'https://s.taobao.com/image', true);
	xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
	xhr.setRequestHeader('X-Requested-with', 'XMLHttpRequest');
	xhr.setRequestHeader('Cache-Control', 'no-cache');
	xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*;q=0.01');

	xhr.onload = function (e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var d = JSON.parse(xhr.response);
			if (d['status'] === 1) {
				chrome.tabs.create({
					url : 'https://s.taobao.com/search?imgfile=&js=1&style=grid&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20161215&ie=utf8&app=imgsearch&tfsid='+ d['name']
				});
			} else {
				if (d.hasOwnProperty("errorMsg")){
				    console.log(d['errorMsg']);
				}
				else{
					console.log("查询失败，请更换图片重试!")
				}
			}
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			console.log("查询失败 " + xhr.status);
		}
	};

	var CRLF = "\r\n";
	var part = "";
	part = 'Content-Disposition: form-data; name=\"imgfile\"; filename=\"' + fName + '\"' + CRLF;
	part += "Content-Type: " + imgType + CRLF + CRLF;
	var request = "--" + boundary + CRLF;
	request += part;

	var blob = new Blob([new Uint8Array(img)], {
			type : imgType
		});
	var reader = new FileReader();
	reader.onloadend = function () {
		request += reader.result;
		request += CRLF;
		request += "--" + boundary + '--' + CRLF;

		var nBytes = request.length,
		ui8Data = new Uint8Array(nBytes);
		for (var nIdx = 0; nIdx < nBytes; nIdx++) {
			ui8Data[nIdx] = request.charCodeAt(nIdx) & 0xff;
		}
		xhr.timeout = 5000; // s seconds timeout, is too long?
        xhr.ontimeout = function () { console.log("查询超时，请稍后重试!"); }
		xhr.send(ui8Data);
	}
	reader.readAsBinaryString(blob);
}

function base64DecToArr(sBase64, nBlocksSize) {

	var
	sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
	nInLen = sB64Enc.length,
	nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
	taBytes = new Uint8Array(nOutLen);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}

	return taBytes;
}
function b64ToUint6(nChr) {

	return nChr > 64 && nChr < 91 ?
	nChr - 65
	 : nChr > 96 && nChr < 123 ?
	nChr - 71
	 : nChr > 47 && nChr < 58 ?
	nChr + 4
	 : nChr === 43 ?
	62
	 : nChr === 47 ?
	63
	 :
	0;

}
function generateBoundary(prefix, len) {
	　　len = len || 32;
	　　var chars = '-_1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	　　var maxPos = chars.length;
	　　var boundary = prefix;
	　　for(i = 0; i < len; i++) {
		　　　　boundary += chars.charAt(Math.floor(Math.random() * maxPos));
		　　
	}
	　　return boundary;
}

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    details.requestHeaders.push({
        name:"Referer",
        value:"https://s.taobao.com"
    });
    details.requestHeaders.push({
        name:"Origin",
        value:"https://s.taobao.com"
    });
    return {
        requestHeaders: details.requestHeaders
    };
},
    {
        urls: ["https://s.taobao.com/*"]
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);