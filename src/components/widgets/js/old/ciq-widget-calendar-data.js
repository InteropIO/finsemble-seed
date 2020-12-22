var Calendar = {
		Viewables: {
			Events: {},
			UnfilteredEvents: {}
		},
		Statistics: {  //last updated times
			Events: null,
			UnfilteredEvents: null
		},
		Template: {
			Data: {
				Symbol: null,
				Last: null,
				Previous: null,
				Change: null,
				PercentChange: null
			},
			Headline: {
				Symbol: null,
				Date: null,
				Subject: null,
				Summary: null,
				SortKey: null,
				CountryCode: null,
				Values: []
			}
		},
		Flags: {
			DATA: 1,
			HEADLINE: 2
		},
		seed: function(object, newSection, iterations, flags){
			for(var i=0; i<iterations; i++){
				this.set(object, newSection, JSON.parse(JSON.stringify(this.Template)), i, flags);
			};
		},
		unseed: function(object, newSection){
			if(!newSection) return;
			if(typeof(object)=="undefined") return;
			if(typeof(object[newSection])=="undefined") return;
			object[newSection]={};
		},
		set: function(object, newSection, template, i, flags){
			if(!(flags&this.Flags.DATA)) delete template.Data;
			if(!(flags&this.Flags.HEADLINE)) delete template.Headline;
			if(typeof(object)=="undefined") object={};
			if(newSection){
				if(typeof(object[newSection])=="undefined") object[newSection]={};
				object[newSection][i]=template;
			}else{
				object[i]=template;
			}
		},
		unset: function(object, newSection, i){
			this.set(object, newSection, {}, i);
		}
	};

var v=Calendar.Viewables;

Calendar.seed(v.UnfilteredEvents,null,PageLimits.events,Calendar.Flags.HEADLINE);

var currentCalendarPointer=null;

function setSectionData(section,data,reverse){
	if(!data) return;
	var t=null;
	var nextAvailable=null;
	for(var s in section){
		if(!section[s].Data.Symbol && (reverse || nextAvailable==null)) {
			if(section[s].Headline && section[s].Headline.Symbol!=null && section[s].Headline.Symbol!=data.Symbol) continue;
			nextAvailable=s;
		}
		if(section[s].Data.Symbol!=data.Symbol) continue;
		t=section[s];
		break;
	}
	if(!t){
		if(nextAvailable==null) return;
		t=section[nextAvailable];
	}
	for(var d in data){
		t.Data[d]=data[d];
	}
}

function setSectionHeadline(section,headline,reverse){
	if(!headline) return;
	if(!headline.Symbol) headline.Symbol=headline.Url;
	var t=null;
	var nextAvailable=null;
	for(var s in section){
		if(!section[s].Headline.Symbol && (reverse || nextAvailable==null)) {
			if(section[s].Data && section[s].Data.Symbol!=null && section[s].Data.Symbol!=headline.Symbol) continue;
			nextAvailable=s;
		}
		if(section[s].Headline.Symbol!=headline.Symbol) continue;
		t=section[s];
		break;
	}
	if(!t){
		if(nextAvailable==null) return;
		t=section[nextAvailable];
	}
	for(var h in headline){
		t.Headline[h]=headline[h];
	}
}

function sortSection(section,flag){
    var arr=[];
    for(var s in section){
    	var inserted=false;
    	for(var a=0;a<arr.length;a++){
    		if(inserted) continue;
    		if(flag&Calendar.Flags.DATA){
    			sortField=(section[s].Data.SortKey!=null?"SortKey":"PercentChange");
    			if(section[s].Data[sortField]>arr[a].Data[sortField]){
    				arr.splice(a,0,section[s]);
    				inserted=true;
    			}
    		}else if(flag&Calendar.Flags.HEADLINE){
    			sortField=(section[s].Headline.SortKey!=null?"SortKey":"Date");
    			if(section[s].Headline[sortField]<arr[a].Headline[sortField]){
    				arr.splice(a,0,section[s]);
    				inserted=true;
    			}
    		}
    	} 
    	if(!inserted) arr.push(section[s]);
    }
    var count=0;
    for (var s in section) {
    	if(arr[count]) section[s]=arr[count];
    	else section[s]=null;
    	count++;
    }	
}

var lastDateRange=null;
var lastOffset=0;
function doFilter(offset){
	if(offset==null) offset=lastOffset;
	var dateRange=document.getElementsByClassName("filter-selected")[0].getAttribute("val");
	if(lastDateRange!=dateRange || lastOffset!=offset){
		lastOffset=offset;
		lastDateRange=dateRange;
		Calendar.seed(v.UnfilteredEvents,null,PageLimits.events,Calendar.Flags.HEADLINE);
		if(dateRange.indexOf("custom-")==0){
			document.getElementsByClassName("ciq-custom-period")[0].children[0].innerHTML=dateRange.split("-").splice(1,2).join(" - ");
		}
		if(dateRange!="custom") doFetch(dateRange, offset);
		var dateDiv=document.getElementsByClassName("ciq-show-dates")[0].children[0];
		if(offset==0 && dateRange=="day"){
			document.getElementsByClassName("ciq-today")[0].style.visibility="hidden";
		}else{
			document.getElementsByClassName("ciq-today")[0].style.visibility="visible";
		}
		formatDate(dateDiv,dateRange,offset);
		return;
	}else{
		if(fetching) return;
	}
	var countryChks=document.getElementsByName("ciq-countries");
	var countries={};
	for(var c=0;c<countryChks.length;c++){
		if(countryChks[c].checked) {
			countries[countryChks[c].value]=true;
		}else{
			countries[countryChks[c].value]=false;			
		}
	}
	var eventChks=document.getElementsByName("ciq-events");
	var events={};
	for(var c=0;c<eventChks.length;c++){
		if(eventChks[c].checked) {
			events[eventChks[c].value]=true;
		}else{
			events[eventChks[c].value]=false;			
		}
	}
	Calendar.seed(v.Events,null,PageLimits.events,Calendar.Flags.HEADLINE);
	for(var ue in v.UnfilteredEvents){
		var event=v.UnfilteredEvents[ue].Headline;
		if(!event.Symbol) continue;
		if(countries[event.CountryCode] || (countries[event.CountryCode]==null && countries["O"])) {
			var categories=EventCalendarTypes(event.Subject);
			if(categories){
				for(var ev in categories){
					if(events[ev]) {
						setSectionHeadline(v.Events,event);
						break;
					}
				}
			}else if(event.Symbol.indexOf("HOL-")==0){
				if(events["Holidays"]) setSectionHeadline(v.Events,event);
			}else if(events["Misc"]) {
				setSectionHeadline(v.Events,event);
			}
		}
	}
	Calendar.Statistics.Events=new Date();
	
	var lis=document.getElementsByClassName("ciq-paginate")[0].getElementsByTagName("LI");
	appendClass(lis[0].children[0],"disabled");
	lis[0].setAttribute("page",1);
	for(var ch=0;ch<lis.length;ch++){
		unappendClass(lis[ch].children[0],"active");
	}
	appendClass(lis[1].children[0],"active");
	lis[lis.length-1].setAttribute("page",2);
	unappendClass(lis[lis.length-1].children[0],"disabled");
	
	if(dateRange=="day"){
		document.getElementsByClassName("ciq-day")[0].cells[0].style.display="none";
		document.getElementsByClassName("ciq-table")[0].children[0].children[0].cells[0].style.display="none";
	}else{
		document.getElementsByClassName("ciq-day")[0].cells[0].style.display="";
		document.getElementsByClassName("ciq-table")[0].children[0].children[0].cells[0].style.display="";		
	}

	renderSection(document.getElementsByClassName("ciq-table")[0],v.Events);
}

function formatDate(div,range,offset){
	var text="";
	if(range=="day"){
		if(offset==0) text="Today";
		else if(offset==-1) text="Yesterday";
		else if(offset==1) text="Tomorrow";
		else {
			var d=new Date(today.getTime());
			d.setDate(d.getDate()+offset);
			text=d.toDateString().replace(/ /,", ");
		}
	}
	else if(range=="week"){
		if(offset==0) text="This Week";
		else if(offset==-1) text="Last Week";
		else if(offset==1) text="Next Week";
		else {
			var d=new Date(today.getTime());
			d.setDate(d.getDate()+offset*7);
			while(d.getDay()>0) d.setDate(d.getDate()-1);
			text="Week of " + d.toDateString().split(" ").splice(1,3).join(" ").replace(/ ([0-9]{4})/,", $1");
		}
	}
	else if(range=="month"){
		if(offset==0) text="This Month";
		else if(offset==-1) text="Last Month";
		else if(offset==1) text="Next Month";
		else {
			var d=new Date(today.getTime());
			d.setDate(1);
			d.setMonth(d.getMonth()+offset);
			var month = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
			text=month[d.getMonth()]+" "+d.getFullYear();
		}
	}
	else if(range=="weekahead") text="Week Ahead";
	else if(range=="monthahead") text="Month Ahead";
	else if(range=="all") text="All Events";

	div.innerHTML=text;
}

function getEventDetail(){
	function showDetail(detail,row,elem){
		if(detail=="") detail="No Description Available";
		row.cells[0].children[0].innerHTML=detail;
		jQuery("body").detailClick(row,elem);
	}
	var row=this.parentNode.parentNode;
	while(!hasClass(row,"ciq-detail")) row=row.nextSibling;
	for(var s in v.Events){
		if(!v.Events[s] || !v.Events[s].Headline) continue;
		var item=v.Events[s].Headline;
		if(item.Symbol==this.id){
			if(item.Summary!=null) {
				var detail=item.Summary;
				showDetail(detail,row,this);
			}else{
				fetchEconomicCalendarDetail(v.Events,this.id,function(detail){
					return showDetail(detail,row,this);
				}.bind(this));
			}
			break;
		}
	}
}

function renderSection(container,section,startingPoint){
	clearEvents();
	var lastDate="";
	var templatetbody=container.children[1];
	var tbody=null;
	var oddRow=false;
	if(!startingPoint) startingPoint=0;
	for(var i=startingPoint;i<Math.min(PageLimits.events,startingPoint+PageLimits.paginate);i++){
		if(!section[i] || !section[i].Headline) break;
		var d=section[i].Headline;
		if(!d.Symbol) continue;
		for(var v=0;v<d.Values.length;v++){
			var row=null;
			var c=0;
			if(v==0){
				var thisDate=d.Date.toDateString().replace(/ /,", ");
				if(lastDate!=thisDate) {
					tbody=container.appendChild(document.createElement("tbody"));
					row=templatetbody.getElementsByClassName("ciq-day")[0].cloneNode(true);
					var datePieces=thisDate.split(" ");
					if(i==startingPoint || lastDate.charAt(lastDate.length-1)==thisDate.charAt(thisDate.length-1)){ // same year
						datePieces.length--;
					}
					while(datePieces.length<row.cells[c].children[0].children.length) row.cells[c].children[0].removeChild(row.cells[c].children[0].lastChild);
					for(var dp=0;dp<datePieces.length;dp++){
						row.cells[c].children[0].children[dp].innerHTML=datePieces[dp].replace(/,/,"");
					}
					c++;
					lastDate=thisDate;
				}else{
					row=templatetbody.getElementsByClassName("ciq-event")[1].cloneNode(true);
				}
				row.cells[c].rowSpan=d.Values.length;
				if(d.Symbol.indexOf("HOL-")==0){
					row.cells[c++].innerHTML="All Day";
				}else{
					row.cells[c++].innerHTML=ampmTime(d.Date).toLowerCase();
				}
				row.cells[c].rowSpan=d.Values.length;
				row.cells[c++].children[0].innerHTML=d.CountryCode;
				row.cells[c].rowSpan=d.Values.length;
				row.cells[c++].innerHTML=d.Subject;
				oddRow=!oddRow;
			}else{
				row=templatetbody.getElementsByClassName("ciq-event-data")[0].cloneNode(true);			
			}
			row.cells[c++].innerHTML=d.Values[v].ValueName;
			row.cells[c++].innerHTML=d.Values[v].Actual;
			row.cells[c++].innerHTML=d.Values[v].Consensus;
			if(v==0){
				row.cells[c].rowSpan=d.Values.length;
				if(d.Symbol.indexOf("HOL-")==0){
					row.cells[c].children[0].style.visibility="hidden";
				}else{
					row.cells[c].children[0].id=d.Symbol;
					row.cells[c].children[0].addEventListener("click",getEventDetail);
				}
			}
			row.setAttribute("evenodd",oddRow?"odd":"even");
			for(var h=0;h<row.cells.length;h++){
				if(h>0 || !hasClass(row,"ciq-day")) {
					appendClass(row.cells[h],row.getAttribute("evenodd"));
					jQuery("body").attachHover(row.cells[h]);
				}
			}
			tbody.appendChild(row);	
		}
		var detail=templatetbody.getElementsByClassName("ciq-detail")[0].cloneNode(true);
		tbody.appendChild(detail);
		
		tbody.rows[0].cells[0].rowSpan=tbody.rows.length;
	}
	if(!section[0].Headline.Symbol) document.getElementsByClassName("none-found")[0].style.display="";
	else container.children[0].style.display="";

	var paginate=document.getElementsByClassName("ciq-paginate");
	if(paginate.length){
		var pagLis=paginate[0].getElementsByTagName("LI");
		var prev=0;
		var next=pagLis.length-1;
		var index=1;
		var active=-1;
		var firstHidden=next;
		pagLis[prev].style.display="";
		pagLis[next].style.display="";
		for(var r=0;r<Object.keys(section).length;r+=PageLimits.paginate,index++){
			pagLis[index].style.display="";
			if(hasClass(pagLis[index].children[0],"active")) active=index;
			if(section[r].Headline.Symbol==null){
				firstHidden=Math.min(firstHidden,index);
				pagLis[index].style.display="none";
				if(r<=PageLimits.paginate){
					pagLis[prev].style.display="none";
					pagLis[index-1].style.display="none";
					pagLis[next].style.display="none";
				}
			}
		}
		for(var n=1;n<firstHidden;n++){
			var li=pagLis[n];
			if(active>4 && active>n+2 && n>1 && n<firstHidden-1){
				if(n==2) {
					if(li.getElementsByClassName("ellipses").length==0){
						li.children[0].style.display="none";
						el1=document.createElement("span");
						el1.className="ellipses";
						el1.innerHTML="...";
						li.appendChild(el1);
					}
				}else{
					appendClass(li,"ellipses");						
				}
			}else if(active<firstHidden-3 && active<n-2 && n>1 && n<firstHidden-1){
				if(n==firstHidden-2) {
					if(li.getElementsByClassName("ellipses").length==0){
						li.children[0].style.display="none";
						el2=document.createElement("span");
						el2.className="ellipses";
						el2.innerHTML="...";
						li.appendChild(el2);
					}
				}else{
					appendClass(li,"ellipses");
				}
			}else{
				unappendClass(li,"ellipses");
				li.children[0].style.display="";
				var ellipses=li.getElementsByClassName("ellipses");
				for(var e=0;e<ellipses.length;e++){
					li.removeChild(ellipses[e]);
				}
			}
		}
		appendClass(paginate[0],"on");
	}

}

function getQuoteURL(){
	if(getStyle(".mn-quotes-overview", "display")!="none") return pageName("overview");
	else if(getStyle(".mn-quotes-news", "display")!="none") return pageName("news");
	else if(getStyle(".mn-quotes-company", "display")!="none") return pageName("company");
	else if(getStyle(".mn-quotes-financials", "display")!="none") return pageName("financials");
	else if(getStyle(".mn-quotes-filings", "display")!="none") return pageName("filings");
	else if(getStyle(".mn-quotes-insiders", "display")!="none") return pageName("insiders");
	return "javascript:void(0);";
}
var quoteURL=getQuoteURL();

var symbol="";
{
	var sArr=queryStringValues("sym",location.search);
	if(sArr.length) symbol=sArr[0].toUpperCase();
	var menu=document.getElementsByClassName("ciq-nav")[0];
	var options=menu.getElementsByTagName("A");
	for(var o=0;o<options.length;o++){
		if(hasClass(options[o].parentNode,"quotes")) options[o].href=quoteURL+"?sym="+encodeURIComponent(symbol);
		else options[o].href+="?sym="+encodeURIComponent(symbol);
	}
	var searchURL=quoteURL;
	//if(searchURL=="javascript:void(0);" && chartIsEntitled) searchURL=pageName("chart")+"?sym="+encodeURIComponent(symbol);
	menu.parentNode.getElementsByTagName("FORM")[0].action=searchURL;
}

function setTodayDate(){
	today=new Date();
	document.getElementsByClassName("ciq-current-time")[0].innerHTML=today.toDateString().replace(/ /,", ")+", "+ampmTimeTz(today);
	today.setMilliseconds(0);
}
setTodayDate();

var fetching=false;

function doFetch(range, offset){
	if(getStyle(".calendar-access","display").indexOf("none")==0) {
		console.log("Feature not entitled");
		return;
	}
	clearEvents();
	document.getElementsByClassName("wait")[0].style.display="";
	fetching=true;
	currentCalendarPointer=range+offset;
	var myEvents={};
	Calendar.seed(myEvents,null,PageLimits.events,Calendar.Flags.HEADLINE);
	fetchEconomicCalendar(myEvents,range,offset,globalCalendar,PageLimits.events,Calendar.Flags.HEADLINE,function(thisPointer){
		if(currentCalendarPointer!=thisPointer) return;
		v.UnfilteredEvents=myEvents;
		fetching=false;
		sortSection(v.UnfilteredEvents,Calendar.Flags.HEADLINE);
		doFilter();
		//renderSection(document.getElementsByClassName("ciq-table")[0],v.Events);
		document.getElementsByClassName("wait")[0].style.display="none";
		Calendar.Statistics.UnfilteredEvents=new Date();
	});
}

function clearEvents(){
	var dataTable=document.getElementsByClassName("ciq-table")[0].getElementsByTagName("tbody")[0];
	while(dataTable.nextSibling) dataTable.parentNode.removeChild(dataTable.nextSibling);
	var pagination=document.getElementsByClassName("ciq-paginate")[0].getElementsByTagName("LI");
	for(var pg=0;pg<pagination.length;pg++) pagination[pg].style.display="none";
	document.getElementsByClassName("none-found")[0].style.display="none";
	document.getElementsByClassName("ciq-table")[0].children[0].style.display="none";
}

var globalCalendar=getComputedStyle(document.getElementsByClassName("ciq-cal-filter-country")[0]).display.indexOf("block")>=0;
if(!globalCalendar){
	var countries=document.getElementsByTagName("input");
	for(var c=0;c<countries.length;c++){
		if(countries[c].name=="ciq-countries" && countries[c].value!="US") countries[c].checked=false;
	}
}

var retrieve = {}; {
	function convertToStyle(param) {
		if (param == "nav") return "ciq-navbar";
		else return param;
	}
	var nodisc = queryStringValues("nodisc", location.hash);
	if (nodisc.length) {
		var footerSec = document.getElementsByClassName("ciq-footer");
		for (var s = 0; s < footerSec.length; s++) {
			footerSec[s].style.display = "none";
		}
	}
	var wArr = queryStringValues("sec", location.hash);
	if (wArr.length) {
		/*var sec = document.getElementsByClassName("ciq-overview-section");
		for (var s = 0; s < sec.length; s++) {
			sec[s].style.display = "none";
		}*/
		document.getElementsByClassName("ciq-navbar")[0].style.display = "none";
		
		
		for (var w = 0; w < wArr.length; w++) {
			retrieve[wArr[w]] = true;
			var widget = document.getElementsByClassName(convertToStyle(wArr[w]))[0];
			if (widget ) {
				widget.style.display = "";
				widget.style.float = "none";
			}
		}
		document.getElementsByClassName("ciq-widget-container")[0].style.display = "";
	} else {
		retrieve = null;
	}
	document.getElementsByClassName("ciq-widget-container")[0].style.display = "";

}

doFilter(0);

//setTimeout("console.log(JSON.stringify(Calendar.Viewables))",5000);
