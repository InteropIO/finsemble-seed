console.log("PRELOAD: throbber.js");

document.addEventListener("DOMContentLoaded", showThrobber);

function showThrobber() {
	document.body.innerHTML += `<style>
/* loading icons */
svg {
	overflow: visible;
  }

  .row {
	margin-top: 0px;
  }

  .white-bars svg, .blue-bars svg {
	max-height: 54px;
  }
  .white-dots svg, .blue-dots svg, .multi-dots svg {
	max-height: 7px;
  }
  .fin-dots svg {
	max-height: 35px;
	overflow: visible !important;
  }
  .line-extend svg {
	margin: 100px 11em 0px;
  }
  .fat-spin svg {
	max-height: 41px;

  }
  .same-spin svg {
	max-height: 41px;
  }


  .blue-bars .cls-1{fill:none;}
  .blue-bars .cls-1,.blue-bars .cls-2{stroke:#039bff;stroke-linecap:round;}
  .blue-bars .cls-2{fill:#121a30;}

  .white-bars .cls-1{fill:none;}
  .white-bars .cls-1,.white-bars .cls-2{stroke:#ffffff;stroke-linecap:round;}
  .white-bars .cls-2{fill:#121a30;}

  .line-extend .cls-1{fill:none;stroke:#039bff;stroke-miterlimit:10;stroke-width:2px;}

  .same-spin .cls-1,.same-spin .cls-2{fill:none;stroke-miterlimit:10;stroke-width:2.44px;}
  .same-spin .cls-1{stroke:#fff;opacity:0.2;}
  .same-spin .cls-2{stroke:#039bff;}

  .fat-spin .cls-1,.fat-spin .cls-2{fill:none;stroke-miterlimit:10;}
  .fat-spin .cls-1{stroke:#fff;stroke-width:1.38px;opacity:0.2;}
  .fat-spin .cls-2{stroke:#039bff;stroke-width:8.95px;}

  .multi-dots .cls-1{fill:#039bff;}
  .multi-dots .cls-2{fill:#ffffff;}

  .white-dots .cls-1{fill:#ffffff;}

  .blue-dots .cls-1{fill:#039bff;}

  .fin-dots .cls-1{fill:#fff;}
  .fin-dots .cls-2{fill:#039bff;}



  /* ===== Begin Functions ====== */

  .blue-dots .circle1, .white-dots .circle1, .multi-dots .circle1, .fin-dots .circle1 {
	opacity: 0;
	  -webkit-animation: blue_dot_one 2s infinite; /* Safari 4+ */
	  -moz-animation:    blue_dot_one 2s infinite; /* Fx 5+ */
	  -o-animation:      blue_dot_one 2s infinite; /* Opera 12+ */
  }
  @-webkit-keyframes blue_dot_one {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  /* Standard syntax */
  @keyframes blue_dot_one {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }
  .blue-dots .circle2, .white-dots .circle2, .multi-dots .circle2, .fin-dots .circle2 {
	opacity: 0;

	  -webkit-animation: blue_dot_two 2s infinite; /* Safari 4+ */
	  -moz-animation:    blue_dot_two 2s infinite; /* Fx 5+ */
	  -o-animation:      blue_dot_two 2s infinite; /* Opera 12+ */
	  animation-delay: .12s;
	-webkit-animation-delay: .12s;
  }
  @-webkit-keyframes blue_dot_two {
	 0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  /* Standard syntax */
  @keyframes blue_dot_two {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  .blue-dots .circle3, .white-dots .circle3, .multi-dots .circle3 {
	opacity: 0;
	  -webkit-animation: blue_dot_three 2s infinite; /* Safari 4+ */
	  -moz-animation:    blue_dot_three 2s infinite; /* Fx 5+ */
	  -o-animation:      blue_dot_three 2s infinite; /* Opera 12+ */
	  animation-delay: .24s;
	-webkit-animation-delay: .24s;
  }
  @-webkit-keyframes blue_dot_three {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  /* Standard syntax */
  @keyframes blue_dot_three {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  .fin-dots .circle3 {
	opacity: 0;
	  -webkit-animation: blue_dot_three 2s infinite; /* Safari 4+ */
	  -moz-animation:    blue_dot_three 2s infinite; /* Fx 5+ */
	  -o-animation:      blue_dot_three 2s infinite; /* Opera 12+ */
	  animation-delay: .24s;
	-webkit-animation-delay: .24s;
  }


  .blue-dots .circle4, .white-dots .circle4, .multi-dots .circle4, .fin-dots .circle4 {
	opacity: 0;
	  -webkit-animation: blue_dot_four 2s infinite; /* Safari 4+ */
	  -moz-animation:    blue_dot_four 2s infinite; /* Fx 5+ */
	  -o-animation:      blue_dot_four 2s infinite; /* Opera 12+ */
	  animation-delay: .36s;
	-webkit-animation-delay: .36s;
  }
  @-webkit-keyframes blue_dot_four {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  /* Standard syntax */
  @keyframes blue_dot_three {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  .blue-dots .circle5, .white-dots .circle5, .multi-dots .circle5, .fin-dots .circle5 {
	opacity: 0;
	  -webkit-animation: blue_dot_five 2s infinite; /* Safari 4+ */
	  -moz-animation:    blue_dot_five 2s infinite; /* Fx 5+ */
	  -o-animation:      blue_dot_five 2s infinite; /* Opera 12+ */
	  animation-delay: .48s;
	-webkit-animation-delay: .48s;
  }
  @-webkit-keyframes blue_dot_five {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  /* Standard syntax */
  @keyframes blue_dot_five {
	  0%   {opacity: 0; transform: translate(0px, 9px);}
	  20%   {opacity: 0; transform: translate(0px, 9px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 9px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 9px);}
  }

  .fat-spin  {
	  transform-origin: 46% 49%;
	  -webkit-animation: fat-spin 1.5s infinite linear; /* Safari 4+ */
	  -moz-animation:    fat-spin 1.5s infinite linear; /* Fx 5+ */
	  -o-animation:      fat-spin 1.5s infinite linear; /* Opera 12+ */
  }
  @-webkit-keyframes fat-spin {
	  0%   {transform:rotate(0deg);}
	  100%  {transform:rotate(360deg);}
  }

  /* Standard syntax */
  @keyframes fat-spin {
	  0%   {transform:rotate(0deg);}
	  100%  {transform:rotate(360deg);}
  }

  .same-spin  {
	  transform-origin: 50% 46%;
	  -webkit-animation: same-spin 1.75s infinite linear; /* Safari 4+ */
	  -moz-animation:    same-spin 1.75s infinite linear; /* Fx 5+ */
	  -o-animation:      same-spin 1.75s infinite linear; /* Opera 12+ */
  }
  @-webkit-keyframes same-spin {
	  0%   {transform:rotate(0deg);}
	  100%  {transform:rotate(360deg);}
  }

  /* Standard syntax */
  @keyframes same-spin {
	  0%   {transform:rotate(0deg);}
	  100%  {transform:rotate(360deg);}
  }

  .line-extend  {
	  -webkit-animation: line-extend 1.75s infinite ease; /* Safari 4+ */
	  -moz-animation:    line-extend 1.75s infinite ease; /* Fx 5+ */
	  -o-animation:      line-extend 1.75s infinite ease; /* Opera 12+ */
  }
  @-webkit-keyframes line-extend {
	  0% {
		-webkit-transform:  translate(-50%,0)  scaleX(0.00) ;
	  }
	  50% {
		-webkit-transform:  translate(0,0)  scaleX(1) ;
	  }
	  100% {
		-webkit-transform:  translate(50%,0)  scaleX(0.00) ;
	  }
  }

  /* Standard syntax */
  @keyframes line-extend {
	  0% {
		-webkit-transform:  translate(-50%,0)  scaleX(0.00) ;
	  }
	  50% {
		-webkit-transform:  translate(0,0)  scaleX(1) ;
	  }
	  100% {
		-webkit-transform:  translate(50%,0)  scaleX(0.00) ;
	  }
  }


  .blue-bars .barset-1, .white-bars .barset-1 {
	opacity: 0;
	  -webkit-animation: bar_set_one 2s infinite ease; /* Safari 4+ */
	  -moz-animation:    bar_set_one 2s infinite ease; /* Fx 5+ */
	  -o-animation:      bar_set_one 2s infinite ease; /* Opera 12+ */
  }
  @-webkit-keyframes bar_set_one {
	  0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }

  /* Standard syntax */
  @keyframes bar_set_one {
	  0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }
  .blue-bars .barset-2, .white-bars .barset-2 {
	opacity: 0;

	  -webkit-animation: bar_set_two 2s infinite ease;  /* Safari 4+ */
	  -moz-animation:    bar_set_two 2s infinite ease;  /* Fx 5+ */
	  -o-animation:      bar_set_two 2s infinite ease;  /* Opera 12+ */
	  animation-delay: .12s;
	-webkit-animation-delay: .12s;
  }
  @-webkit-keyframes bar_set_two {
	 0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }

  /* Standard syntax */
  @keyframes bar_set_two {
	  0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }

  .blue-bars .barset-3, .white-bars .barset-3 {
	opacity: 0;
	  -webkit-animation: bar_set_three 2s infinite ease;  /* Safari 4+ */
	  -moz-animation:    bar_set_three 2s infinite ease;  /* Fx 5+ */
	  -o-animation:      bar_set_three 2s infinite ease;  /* Opera 12+ */
	  animation-delay: .24s;
	-webkit-animation-delay: .24s;
  }
  @-webkit-keyframes bar_set_three {
	  0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }

  /* Standard syntax */
  @keyframes bar_set_three {
	  0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }



  .blue-bars .barset-4, .white-bars .barset-4 {
	opacity: 0;
	  -webkit-animation: bar_set_four 2s infinite ease;  /* Safari 4+ */
	  -moz-animation:    bar_set_four 2s infinite ease;  /* Fx 5+ */
	  -o-animation:      bar_set_four 2s infinite ease;  /* Opera 12+ */
	  animation-delay: .36s;
	-webkit-animation-delay: .36s;
  }
  @-webkit-keyframes bar_set_four {
	 0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }

  /* Standard syntax */
  @keyframes bar_set_four {
	  0%   {opacity: 0; transform: translate(0px, 12px);}
	  20%   {opacity: 0; transform: translate(0px, 12px);}
	  50%  {opacity: 1; transform: translate(0px, 0px);}
	  85%  {transform: translate(0px, 12px);}
	  95%  {opacity: 0;}
	  100% {opacity: 0; transform: translate(0px, 12px);}
  }

  .white-bars .line1, .blue-bars .line1 {
	transform-origin: 50% 50%;
	  -webkit-animation: bar-line-extend 2s infinite ease; /* Safari 4+ */
	  -moz-animation:    bar-line-extend 2s infinite ease; /* Fx 5+ */
	  -o-animation:      bar-line-extend 2s infinite ease; /* Opera 12+ */
	  animation-delay: .12s;
	-webkit-animation-delay: .12s;
  }
  @-webkit-keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }

  /* Standard syntax */
  @keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }
  .white-bars .line2, .blue-bars .line2 {
	transform-origin: 50% 50%;
	  -webkit-animation: bar-line-extend 2s infinite ease; /* Safari 4+ */
	  -moz-animation:    bar-line-extend 2s infinite ease; /* Fx 5+ */
	  -o-animation:      bar-line-extend 2s infinite ease; /* Opera 12+ */
	  animation-delay: .24s;
	-webkit-animation-delay: .24s;
  }
  @-webkit-keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }

  /* Standard syntax */
  @keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }
  .white-bars .line3, .blue-bars .line3 {
	transform-origin: 50% 50%;
	  -webkit-animation: bar-line-extend 2s infinite ease; /* Safari 4+ */
	  -moz-animation:    bar-line-extend 2s infinite ease; /* Fx 5+ */
	  -o-animation:      bar-line-extend 2s infinite ease; /* Opera 12+ */
	  animation-delay: .36s;
	-webkit-animation-delay: .36s;
  }
  @-webkit-keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }

  /* Standard syntax */
  @keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }
  .white-bars .line4, .blue-bars .line4 {
	transform-origin: 50% 50%;
	  -webkit-animation: bar-line-extend 2s infinite ease; /* Safari 4+ */
	  -moz-animation:    bar-line-extend 2s infinite ease; /* Fx 5+ */
	  -o-animation:      bar-line-extend 2s infinite ease; /* Opera 12+ */
	  animation-delay: .48s;
	-webkit-animation-delay: .48s;
  }
  @-webkit-keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }

  /* Standard syntax */
  @keyframes bar-line-extend {
	  0% {
		-webkit-transform:  scaleY(0.00) ;
	  }
	  50% {
		-webkit-transform:  scaleY(1) ;
	  }
	  100% {
		-webkit-transform:  scaleY(0.00) ;
	  }
  }

</style>
<div id="finsemble-throbber" class="fin-dots" style="background: black; position: fixed; top: 0px; left:0; height:calc(100vh); width:100vw; z-index: 2147483647; display: flex; align-items: center; justify-content: center;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 101.1 19.19" style="height: 100px; margin: 0px;">
  <g id="Layer_2" data-name="Layer 2">
	<g id="Layer_1-2" data-name="Layer 1">
	  <circle class="cls-2 circle1" cx="3.6" cy="9.59" r="3.6"/>
	  <circle class="cls-2 circle2" cx="24.44" cy="9.59" r="3.6"/>

	  <g class="circle3">
	  <polygon class="cls-1" points="50.57 19.17 41.7 15.81 41.7 10.15 50.57 13.51 50.57 19.17"/>
	  <path class="cls-1" d="M50.58,19.19l-8.89-3.37V10.13l8.89,3.37ZM41.72,15.8l8.83,3.35V13.52l-8.83-3.35Z"/>
	  <polygon class="cls-2" points="51.08 12.17 50.55 12.33 50.51 6.78 41.69 10.13 50.55 13.49 59.41 10.13 51.09 6.97 51.08 6.98 51.08 12.17"/>
	  <polygon class="cls-2" points="59.41 3.36 50.51 6.77 41.69 3.36 50.55 0 59.41 3.36"/>
	  <path class="cls-1" d="M41.69,9l8.86,3.31V6.77L41.69,3.36Z"/>
	  </g>

	  <circle class="cls-2 circle4" cx="76.65" cy="9.59" r="3.6"/>
	  <circle class="cls-2 circle5" cx="97.5" cy="9.59" r="3.6"/>
	</g>
  </g>
</svg>
</div>

`;
}

window.removeFinsembleThrobber = function() {
	var throbber = document.getElementById("finsemble-throbber");
	if (throbber) throbber.style.display = "none";
};
