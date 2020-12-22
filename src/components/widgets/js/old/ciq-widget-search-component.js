
var CIQSearchWidget=function(){};

(function(cws){

	var callback=function(){};
	var searchDiv;
	var input;
	var go;

	var cancel=false;
	var searchWizardScroll=null;
	var myRoot=getMyRoot();

	var lastSearchResult=[];
	
	function widgetize(){
		jQuery.noConflict();
		(function ( $ ) {
			$(searchDiv).wrap(
			$('<div>').addClass('ciq-search ciq-widget-area')
			.append($('<div>')))
			.after($('<div>').addClass('ciq-search-results')
			.append($('<div>').addClass('scroller')
			.append($('<ul>')
			.append($('<li>')
			.append($('<span/><span/><span/>'))))));

			loadScripts(["js/selectivizr.js"]);

			input=$('.ciq-search input[type=text], .ciq-search input[type=search]');
			go=$('.ciq-search input[type=submit], .ciq-search input[type=button], .ciq-search button');
			
			var maxResults=50;
	
			for(var r=1;r<maxResults;r++) {
				$('.ciq-search-results ul').first().append( $('.ciq-search-results li').first().clone() );
			}
	
			input.on('focus',function(){
				window.SymbolLookupModule.loadSymbolLookupTables(true);
			});
			input.on('keyup',function(e){
				if($( this ).val()){
					var key = (window.event) ? event.keyCode : e.keyCode;
					if(key==13){
						$( this ).blur();
						accept();
						return false;
					}
					cancel=false;
					window.SymbolLookupModule.doSymbolLookup("",$( this ).val(),maxResults,function(results){
						if(cancel) return;
						lastSearchResult=results;
						if(results.length){
							$(".ciq-search-results li").each(function(index){
								$( this ).hide();
								$( this ).off();
								if(results[index]){
									var obj={"symbol":results[index].symbol, "description":results[index].name, "exchange":results[index].exchDisp};
									$( this ).show();
									$( this ).children("span").eq(0).html(obj.symbol);
									$( this ).children("span").eq(1).html(obj.exchange);
									$( this ).children("span").eq(2).html(obj.description);
									$( this ).one(($.support.opacity?"tap":"click"),function(o) {
										return function(){
											input.val(o.symbol);
											input.blur();
											$('.ciq-search-results').hide();
											callback(o);
											return false;
										};
									}(obj));
								}
							});
							$(".ciq-search-results").show();
							setTimeout(function () { if(searchWizardScroll) searchWizardScroll.refresh(); }, 0);
						}else{
							$(".ciq-search-results").hide();
						}
					});
				}else{
					$(".ciq-search-results").hide();
				}
			});
			input.on('click search',function(){
				window.setTimeout(function(){ if(input.val()=="") $(".ciq-search-results").hide(); },10);
			});
			if(go) go.on('click',function(){
				accept();
			});
			$('.ciq-search-results').on('touchstart',function(){
				input.focus();
			});
		
		
		})(jQuery);
	
		searchWizardScroll = new IScroll('.ciq-search-results', { mouseWheel: true, interactiveScrollbars:true, scrollbars: 'custom', tap:true });
	
	};
	
	function getMyRoot(){
		sc = document.getElementsByTagName("script");
		for(idx = 0; idx < sc.length; idx++){
			s = sc[idx];
			if(s.src && s.src.indexOf("ciq-widget-search-component.js")>-1){
				return s.src.replace(/js\/ciq-widget-search-component\.js/,"");
			}
		}
		return null;
	}
	
	function loadScripts(scripts, cb){
		if(!cb) cb=function(){};
		if(!scripts || !scripts.length) {
			cb(); return;
		}
		var script=document.createElement("script")
		script.type="text/javascript";
		script.src=myRoot+scripts[0];
		var closure=function(orsc){
			return function(){
				if(orsc && (this.readyState=="uninitialized" || this.readyState=="loading")) return;
				if(scripts.length==1) cb();
				else loadScripts(scripts.slice(1), cb);
			};
		};
		if(script.onreadystatechange===null) script.onreadystatechange=closure(true);
		else script.onload=closure();
		document.getElementsByTagName("head")[0].appendChild(script);
	};
	
	function loadStylesheets(sheets, cb){
		if(!cb) cb=function(){};
		if(!sheets || !sheets.length) {
			cb(); return;
		}
		var sheet=document.createElement("link")
		sheet.rel="stylesheet";
		sheet.type="text/css";
		sheet.href=myRoot+"css/"+sheets[0]+".css";
		var closure=function(orsc){
			return function(){
				if(orsc && (this.readyState=="uninitialized" || this.readyState=="loading")) return;
				if(sheets.length==1) cb();
				else loadStylesheets(sheets.slice(1), cb);
			};
		};
		if(sheet.onreadystatechange===null) sheet.onreadystatechange=closure(true);
		else sheet.onload=closure();
		document.getElementsByTagName("head")[0].appendChild(sheet);
	};

	function createWidget(element,cb,useDefaultStylesheet){
		searchDiv=element;
		callback=cb;
		var defaultStylesheet=(useDefaultStylesheet===false?[]:["ciq-widget-search"]);
		loadStylesheets(defaultStylesheet, function(){
			loadScripts(["js/min/jquery-latest.min.js","js/ciq-widget-utilities.js","js/iscroll.js","js/ciq-widget-symbol-search.js"], widgetize);
		});
	}
	
	function accept(value){
		if(!callback) return;
		if(!value && value!==0){
			if(!input) return;
			jQuery.noConflict();
			jQuery('.ciq-search-results').hide();
			cancel=true;
			value=input.val();
		}
		var obj={"symbol":value};
		if(lastSearchResult && lastSearchResult.length){
			for(var i=0;i<lastSearchResult.length;i++){
				if(lastSearchResult[i].symbol==value.toUpperCase()){
					obj={"symbol":lastSearchResult[i].symbol, "description":lastSearchResult[i].name, "exchange":lastSearchResult[i].exchDisp};
					break;
				}
			}
		}
		callback(obj);
	}
	
	cws.createWidget=createWidget;
	cws.accept=accept;
	
})(CIQSearchWidget);

