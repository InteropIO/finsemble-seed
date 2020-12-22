(function ( $ ) {

/*	// Make Quote dropdown work on touch devices at full size
	$( function() {
	    $( '.ciq-quote-filter ul' ).doubleTapToGo();
	});
*/	
	// Filter Functionality
	$(".ciq-filter .filter-option").hide();

	var filterSlideClosed=true;
	$(".ciq-filter li").on("click",function() {
		$(".ciq-filter").toggleClass("active");
		$(".ciq-filter li").addClass("filter-option").removeClass("filter-selected");
		$( this ).addClass("filter-selected").removeClass("filter-option");
		if(!filterSlideClosed) doFilter();
		$(".filter-option").slideToggle(function(){
			filterSlideClosed=$( this ).is(":hidden");
		});
	});
		
	// News Highlighting
	$(".ciq-news li").on("click",function() {
		if($( this ).hasClass("active")) {
			activeStory=$( this ).find("a").eq(1).prop("href");
			return true;
		}
		$(".ciq-news li").removeClass("active");
		$(".ciq-news .ciq-news-head a").prop("href", "javascript:void(0);");
		$( this ).addClass("active");
		var hrefs=$( this ).find("a");
		hrefs.eq(1).prop("href",hrefs.eq(2).prop("href"));
		activeStory=hrefs.eq(1).prop("href");
		return false;
	});
	
	//Symbol searching
	$('.ciq-search input[name=sym]').on('focus',function(){
		window.SymbolLookupModule.loadSymbolLookupTables(true);
	});
	$('.ciq-search input[name=sym]').on('keyup',function(){
		var input=$( this );
		if($( this ).val()){
			window.SymbolLookupModule.doSymbolLookup("",$( this ).val(),PageLimits.searchResults,function(results){
				if(results.length){
					$(".ciq-search-results li").each(function(index){
						$( this ).hide();
						if(results[index]){
							$( this ).show();
							$( this ).children("span").eq(0).html(results[index].symbol);
							$( this ).children("span").eq(1).html(results[index].exchDisp);
							$( this ).children("span").eq(2).html(results[index].name);
							$( this ).on(($.support.opacity?"tap":"click"),function() {
								input.val(results[index].symbol);
								input.parent().submit();
								return false;
							});
						}
					});
					$(".ciq-search-results").show();
					setTimeout(function () {
						if(myScroll && myScroll.searchWizardScroll) myScroll.searchWizardScroll.refresh();
					}, 0);
				}else{
					$(".ciq-search-results").hide();
				}
			});
		}else{
			$(".ciq-search-results").hide();
		}
	});
	$('.ciq-search input[name=sym]').on('click search',function(){
		function fn(){
			if($('.ciq-search input[name=sym]').val()=="") $(".ciq-search-results").hide();
		}
		window.setTimeout(fn,10);
	});
	$('.ciq-search-results').on('touchstart',function(){
		$('.ciq-search input[type=submit]').focus();
	});


	// hide nav bar if no nav elements
	/*var navsToDisplay=0;
	$(".ciq-nav li").each(function () {
		if ($(this).css("display") != "none") navsToDisplay++;
	});
	if(navsToDisplay==0) {
		$(".ciq-nav").css("display","none");
		if($("ciq-search").css("display")=="none") $(".ciq-nav-quote").css("display","none");
	}*/

	$.fn.addExternalStyleSheet = function (callback){
		// get external stylesheet from CSS settings
		var u=getUrlFromStylesheet("external-stylesheet");
		if(u){
			$('<link>')
			  .appendTo('head')
			  .attr({type : 'text/css', rel : 'stylesheet'})
			  .attr('href', u);
			  //.on("load error", callback);
		} 
		
		// get external stylesheet if specified in URL
		var customCSS = queryStringValues("customcss", location.search);
		if (customCSS.length) {
			$('<link>')
			  .appendTo('head')
			  .attr({type : 'text/css', rel : 'stylesheet'})
			  .attr('href', customCSS[0]);
		}
		
		//else{
			callback();
		//}
	};

	$.fn.loadScripts = function (scripts, callback){
		if(!callback) callback=function(){};
	    $.ajax({
            type: "GET",
            url: scripts[0],
            success: (scripts.length==1 ? callback : function(){$.fn.loadScripts(scripts.slice(1), callback);}),
            dataType: "script",
            cache: true
	    });
	};

})(jQuery);

(function (i, s, o, g, r, a, m) {
	i['GoogleAnalyticsObject'] = r;
	i[r] = i[r] || function () {
		(i[r].q = i[r].q || []).push(arguments)
	}, i[r].l = 1 * new Date();
	a = s.createElement(o),
		m = s.getElementsByTagName(o)[0];
	a.async = 1;
	a.src = g;
	m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-30306856-10', 'auto');
ga('send', 'pageview');
