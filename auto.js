// let isfirst = true;
var basecode = getBase64Image(document.getElementsByTagName("img")[0]);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log(request.info);
    var img = document.getElementsByTagName("img")[0];
    // imageToCanvas(img);
    // console.log(img)
    // reader.onload=function(e)
    // {
    //     var result=document.getElementById("result");
    //     result.innerHTML='<img src="'+this.result+'" alt=""/>'
    // }
    // imageToCanvas(request.info);
    // window.open("https://s.taobao.com/search?imgfile=&js=1&style=grid&stats_click=search_radio_all%3A1&initiative_id=staobaoz_20161215&ie=utf8&app=imgsearch&tfsid=OO000&upload="+request.info);
  //   if(confirm("由于浏览器安全限制，无法读取本地文件。")){
  //           alert(document.getElementsByTagName('input'));
  // }
  	// isfirst = true;
  	// new $Msg({
   //      content:"由于浏览器安全限制，无法读取本地文件",
   //      type:"success",
   //      // cancle:function(){
   //      //   let cancle = new $Msg({
   //      //     content:"取消"
   //      //   })
   //      // },
   //      confirm:function(){
   //        document.getElementsByClassName('msg-footer-confirm-button')[0].innerText="确定1";
   //        new $Msg({content:' <input type="file" id="files" accept=".png,.jpg,.gif,.jpeg">'});
   //      }
   //    })
  	// console.log(basecode);
  	sendResponse(basecode);
});
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
    return dataURL;
}
// if(window.location.href.indexOf("s.taobao.com")!=-1&&GetUrlParam("upload")!=null){
// 	var url = GetUrlParam("upload");
// 	url = decodeURIComponent(url);
// 	console.log(url);
// 	imageToCanvas(url);
// }



// function fileImport() {
//     var selectedFile = document.getElementById('files').files[0];
//     var name = selectedFile.name;
//     var reader = new FileReader();
//     reader.readAsDataURL(selectedFile);
//     reader.onload = function() {
//     	chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
// 		  console.log(this.result);
// 		});
//     }
// }