(function( $ ) {

	// Widget classes for screens sizes
	var originalWidth;
	
	function sizing() {
		var section = $('.ciq-widget-area');
		var width = section.width();
		
		if (width < 620) {
			section.addClass('ciq-slim');
		}
		if (width > 620) {
		   section.removeClass('ciq-slim');
		}
		if (width < 550) {
			section.addClass('ciq-narrow');
		}
		if (width > 550) {
		   section.removeClass('ciq-narrow');
		}
		if (width < 450) {
			section.addClass('ciq-mobile');
			if (width != originalWidth) $(".ciq-quote-filter ul").hide();
			$(".ciq-quote-filter div span:nth-child(1)").hide();
			$(".ciq-footer").css('padding-bottom', '0px');
			$(".ciq-quote-chart").css('padding', '5px');
			$(".datatable tr td:nth-child(5)").css('display', 'none');
			$(".datatable tr th:nth-child(5)").css('display', 'none');

		};
		if (width > 450)  {
		   section.removeClass('ciq-mobile');
		   $(".ciq-quote-filter ul").show();
			$(".ciq-quote-filter div span:nth-child(1)").show();
			$(".ciq-quote-chart").css('padding', '10px');
			$(".ciq-footer").css('padding-bottom', '20px');
			$(".datatable tr td:nth-child(5)").css('display', '');
			$(".datatable tr th:nth-child(5)").css('display', '');
		}
		
		originalWidth = width;
	}
	
	
	
	$(document).load(sizing);
	
	$(window).resize(sizing);

	$(".ciq-quote-filter").on("click",function() {
		if($(".ciq-widget-area").hasClass("ciq-mobile")){
			$(".ciq-quote-filter ul").slideToggle();
			$(".ciq-quote-filter").toggleClass("active");
		}
		return true;
	});

})(jQuery);