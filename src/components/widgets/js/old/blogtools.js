function doOnLoadCIQ(){
	var doSymbolLinks=function(){
		var linkifySymbol=function(elem){
			var sendMessage=function(e){
				e.preventDefault();
				if(e.currentTarget.symbol=="") return;
				var message=e.currentTarget.symbol+"|"+USER_NAME;
				var iframe=document.getElementById('receiver');
				iframe.style.display="";
				doResizeIFrame();
				iframe.contentWindow.postMessage(message, "*");
			};
			var b=document.createElement("a");
			b.href="javascript:void(0);";
			var sym=elem.innerHTML;
			b.symbol=sym;
			b.innerHTML=sym;
			b.style.display="";
			b.onclick=sendMessage;
			return b;
		};
		var story=document.getElementById("story");
		var syms=story.getElementsByTagName("ciq");
		for(var i=syms.length-1;i>=0;i--){
			syms[i].parentNode.replaceChild(linkifySymbol(syms[i]),syms[i]);
		}
	};
	var placeIFrame=function(){
		var b=document.createElement("iframe");
		b.id="receiver";
		b.style.display="none";
		b.setAttribute("frameborder","0");
		b.setAttribute("scrolling","no");
		b.src=TARGET_RESOURCE;
		var d=document.getElementById("chart");
		d.parentNode.replaceChild(b,d);
	};
	placeIFrame();
	doResizeIFrame();
	doSymbolLinks();
}

function doResizeIFrame(){
	var iframe=document.getElementById("receiver");
	if(iframe){
		iframe.width=Math.min(MAX_IFRAME_WIDTH,window.innerWidth-40);
		iframe.height=FIXED_IFRAME_HEIGHT+'px';
	}
}

window.onload=doOnLoadCIQ;
window.onresize=doResizeIFrame;

