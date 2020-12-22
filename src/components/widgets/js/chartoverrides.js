			CIQ.ChartEngine.prototype.createTickXAxisWithDates = function (chart) {
				if (typeof chart == 'undefined' || !chart) chart = this.chart;
				var context = chart.context;
				var axisRepresentation = [];

				// find first valid bar in dataSegment
				for (var x = 0; x < chart.dataSegment.length; x++)
					if (chart.dataSegment[x]) break;

					//return if no bars
				if (x == chart.dataSegment.length) return [];

				//how many years/months/days on chart
				var prevDT = chart.dataSegment[x].displayDate ? chart.dataSegment[x].displayDate : chart.dataSegment[x].DT;
				var prevDataDT = chart.dataSegment[x].DT;
				var prevYear = prevDT.getFullYear();
				var prevTime = prevDT.getTime();
				var pixel = this.pixelFromDate(prevDataDT);

				var timeSegments = {};
				timeSegments[prevYear] = {
					minTime: prevTime,
					maxTime: prevTime,
					minPixel: pixel,
					maxPixel: pixel,
					months: [prevDT.getMonth()],
					monthData: {

					},
					points: 1
				};

				timeSegments[prevYear].monthData[prevDT.getMonth()] = {
					minTime: prevTime,
					maxTime: prevTime,
					minPixel: pixel,
					maxPixel: pixel,
					points: 1,
					days: [prevDT.getDate()],
					dayData: {

					}
				};

				timeSegments[prevYear].monthData[prevDT.getMonth()].dayData[prevDT.getDate()] = {
					minTime: prevTime,
					maxTime: prevTime,
					minPixel: pixel,
					maxPixel: pixel,
					points: 1
				};

				var years = [prevYear];
				for (var i = x + 1; i < chart.dataSegment.length; i++) {
					var currentDT = chart.dataSegment[i].displayDate ? chart.dataSegment[i].displayDate : chart.dataSegment[i].DT;
					var currentDataDT = chart.dataSegment[i].DT;
					var currentYear = currentDT.getFullYear();
					var currentTime = currentDT.getTime();
					pixel = this.pixelFromDate(currentDataDT);
					if (!timeSegments[currentYear]) { //Add New Year
						timeSegments[currentYear] = {
							minTime: currentTime,
							maxTime: currentTime,
							minPixel: pixel,
							maxPixel: pixel,
							months: [currentDT.getMonth()],
							monthData: {

							},
							points: 1
						};

						timeSegments[currentYear].monthData[currentDT.getMonth()] = {
							minTime: currentTime,
							maxTime: currentTime,
							minPixel: pixel,
							maxPixel: pixel,
							points: 1,
							days: [currentDT.getDate()],
							dayData: {

							}
						};

						timeSegments[currentYear].monthData[currentDT.getMonth()].dayData[currentDT.getDate()] = {
							minTime: currentTime,
							maxTime: currentTime,
							minPixel: pixel,
							maxPixel: pixel,
							points: 1
						};
						years.push(currentYear);
					} else {
						timeSegments[currentYear].points++;
						timeSegments[currentYear].maxTime = currentTime;
						timeSegments[currentYear].maxPixel = pixel;
						var currentMonth = currentDT.getMonth();
						var currentDate = currentDT.getDate();
						if (currentMonth != prevDT.getMonth()) { //Add new month
							timeSegments[currentYear].months.push(currentMonth);
							timeSegments[currentYear].monthData[currentMonth] = {
								minTime: currentTime,
								maxTime: currentTime,
								minPixel: pixel,
								maxPixel: pixel,
								points: 1,
								days: [currentDate],
								dayData: {

								}
							};
							timeSegments[currentYear].monthData[currentMonth].dayData[currentDate] = {
								minTime: currentTime,
								maxTime: currentTime,
								minPixel: pixel,
								maxPixel: pixel,
								points: 1
							};
						} else {
							timeSegments[currentYear].monthData[currentMonth].maxTime = currentTime;
							timeSegments[currentYear].monthData[currentMonth].points++;
							timeSegments[currentYear].monthData[currentMonth].maxPixel = pixel;
							if (currentDate != prevDT.getDate()) { //Add new day to month					
								timeSegments[currentYear].monthData[currentMonth].days.push(currentDate);
								timeSegments[currentYear].monthData[currentMonth].dayData[currentDate] = {
									minTime: currentTime,
									maxTime: currentTime,
									minPixel: pixel,
									maxPixel: pixel,
									points: 1
								};
							} else {
								timeSegments[currentYear].monthData[currentMonth].dayData[currentDate].maxTime = currentTime;
								timeSegments[currentYear].monthData[currentMonth].dayData[currentDate].maxPixel = pixel;
								timeSegments[currentYear].monthData[currentMonth].dayData[currentDate].points++;

							}
						}
					}

					prevDT = new Date(currentDT);
				}





				var labelWidth = context.measureText("00:00").width + 10; //10 extra for spacing
				var dataWidth = timeSegments[years[years.length - 1]].maxPixel - timeSegments[years[0]].minPixel;
				var numLabels = Math.floor(dataWidth / labelWidth);

				// (if years > 1) - year boundaries
				if (years.length > 1) {
					var spacing = 1;
					if (years.length > numLabels) {
						spacing = Math.floor(years.length / numLabels);
					}

					var labelsBetweenYears = {
						noLabels: true,
						yearList: {}
					};
					var startAt = 0;
					for (var i = 0; i < years.length; i += spacing) {
						var year = years[i];
						//var prevYear = years[i - 1];
						var yearWidth = timeSegments[year].maxPixel - timeSegments[year].minPixel;
						if (((yearWidth - labelWidth) > labelWidth || i == years.length - 1) && spacing == 1) {
							labelsBetweenYears.noLabels = false;
							labelsBetweenYears.yearList[i] = true;
						}
						if (i == 0 && yearWidth < (labelWidth * 1.5)) { //this prevents the first label from overriding the second label TODO: figure out exact math.
							startAt = 1;
						}
					}

					//last two year axis points
					var lastYearAxisPoint;
					var secondLastYearAxisPoint;

					if (labelsBetweenYears.noLabels) {
						for (var i = startAt; i < years.length; i += spacing) {
							var year = years[i];
							axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(timeSegments[year].minPixel, "line", year));
							if (i > startAt) {
								secondLastYearAxisPoint = {
									year: lastYearAxisPoint.year,
									pixel: lastYearAxisPoint.pixel
								}
							}
							lastYearAxisPoint = {
								year: year,
								pixel: timeSegments[year].minPixel
							}
						}
					} else {
						var j = 0;
						for (var i = 0; i < years.length; i++) {
							var year = years[i];
							if (i > startAt) {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(timeSegments[year].minPixel, "boundary", year));
								if (j > 0) {
									secondLastYearAxisPoint = {
										year: lastYearAxisPoint.year,
										pixel: lastYearAxisPoint.pixel
									}
								}
								lastYearAxisPoint = {
									year: year,
									pixel: timeSegments[year].minPixel
								}
								j++;
							}
							if (labelsBetweenYears.yearList[i]) {
								monthAxisPoints = this.getMonthAxisPoints(timeSegments[year], i == (years.length - 1));
								axisRepresentation = axisRepresentation.concat(monthAxisPoints);
							}


						}
					}

					//get last axis point and decide if we need to continue the axis
					if (lastYearAxisPoint && secondLastYearAxisPoint) {
						var pixelGap = lastYearAxisPoint.pixel - secondLastYearAxisPoint.pixel;
						var timeGap = lastYearAxisPoint.year - secondLastYearAxisPoint.year;
						var nextPointHz = lastYearAxisPoint.pixel + pixelGap;
						var nextYear = lastYearAxisPoint.year + timeGap;
						while (nextPointHz < chart.width) {
							if (labelsBetweenYears.noLabels) {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "line", nextYear));
							} else {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "boundary", nextYear));
							}
							nextPointHz += pixelGap;
							nextYear += timeGap;
						}
					} else if (lastYearAxisPoint) { //edge case with only one axis point:
						//How long should a year be?
						var segment = timeSegments[lastYearAxisPoint.year];
						
						var pixelGap;

						if (segment.months.length > 2) {
							var lastMonth = segment.monthData[segment.months.length - 1];
							var secondMonth = segment.monthData[1];
							var monthLength = (lastMonth.minPixel - secondMonth.minPixel)/(segment.months.length - 1);
							pixelGap = monthLength * 12;
						} else if (segment.months.length == 2) {
							var lastMonth = segment.monthData[1];
							var firstMonth = segment.monthData[0];
							var dayLengths = [];
							for (var i in lastMonth.days) {
								var dayData = lastMonth.dayData[lastMonth.days[i]];
								if (dayLengths.length == 0) {
									dayLengths.push (dayData.maxTime - dayData.minTime);
								}
							}
							for (var i in firstMonth.days) {
								var dayData = firstMonth.dayData[firstMonth.days[i]];
								if (dayLengths.length == 0) {
									dayLengths.push (dayData.maxTime - dayData.minTime);
								}
							}
							dayLengths.sort();
							var median = dayLengths[Math.floor(dayLengths.length/2)];
							pixelGap = median*252;
						} else if (segment.months.length == 1) {
							monthAxisPoints = this.getMonthAxisPoints(segment, true);
							axisRepresentation = axisRepresentation.concat(monthAxisPoints);
						}
						
						if (pixelGap) {
							var nextPointHz = lastYearAxisPoint.pixel + pixelGap;
							var nextYear = lastYearAxisPoint.year + 1;

							while (nextPointHz < chart.width) {
								if (labelsBetweenYears.noLabels) {
									axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "line", nextYear));
								} else {
									axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "boundary", nextYear));
								}
								nextPointHz += pixelGap;
								nextYear += 1;
							}
						}

					}


				} else { /*if (timeSegments[years[0]].months.length>1) {*/
					monthAxisPoints = this.getMonthAxisPoints(timeSegments[years[0]], true);
					axisRepresentation = axisRepresentation.concat(monthAxisPoints);
				}
				/*else { 
					
				}*/
				// go through years if additional axispoints reqd
				// if (months > 1) - month boundaries
				// go through months if additional axispoints reqd
				// if (days > 1) - day boundaries
				// go through days if additional axis points reqd
				// figure out distance between axis points and get round minute points.
				// figure out axis points before and after chart
				// console.log(axisRepresentation);
				
				if (axisRepresentation.length > 2) {
					return axisRepresentation;
				} else {
					return this.createTickXAxisWithDatesOld(chart);
				}

			}

			CIQ.ChartEngine.prototype.getMonthAxisPoints = function (year, isLast) {
				chart = this.chart;
				var context = chart.context;
				var axisRepresentation = [];

				var labelWidth = context.measureText("00:00").width + 10; //10 extra for spacing
				var dataWidth = year.maxPixel - year.minPixel;
				var numLabels = Math.floor(dataWidth / labelWidth);

				if (numLabels == 0) return [];

				var months = year.months;

				if (months.length > 1) {
					var spacing = 1;
					if (months.length > numLabels) {
						spacing = months.length / (numLabels+1);
					}

					var labelsBetweenMonths = {
						noLabels: true,
						monthList: {}
					};
					var startAt = 0;

					// To make this neat, start at the middle month and then move up and down by spacing
					//var middleMonth = Math.ceil(months.length / 2);

					var monthsToLabel = [];
					/*for (var i = middleMonth; i < months.length; i += spacing) {
						var month = months[i];
						//var prevMonth = months[i - 1];
						var monthWidth = year.monthData[month].maxPixel - year.monthData[month].minPixel;
						if ((monthWidth - labelWidth) > labelWidth && spacing == 1) {
							labelsBetweenMonths.noLabels = false;
							labelsBetweenMonths.monthList[i] = true;
						}
						monthsToLabel.push(i);
					}
					for (var i = middleMonth - spacing; i >= 0; i -= spacing) {
						var month = months[i];
						//var prevMonth = months[i - 1];
						var monthWidth = year.monthData[month].maxPixel - year.monthData[month].minPixel;
						if ((monthWidth - labelWidth) > labelWidth && spacing == 1) {
							labelsBetweenMonths.noLabels = false;
							labelsBetweenMonths.monthList[i] = true;
						}
						monthsToLabel.unshift(i);
					}*/
					for (var i = 0; i<months.length; i+= spacing) {
						monthIndex = Math.round(i);
						if (monthIndex>=months.length) break;
						var month = months[monthIndex];
						//var prevMonth = months[i - 1];
						var monthWidth = year.monthData[month].maxPixel - year.monthData[month].minPixel;
						if (((monthWidth - labelWidth) > labelWidth || i == months.length-1) && spacing == 1) {
							labelsBetweenMonths.noLabels = false;
							labelsBetweenMonths.monthList[monthIndex] = true;
						}
						monthsToLabel.push(monthIndex);
					}

					var lastMonthAxisPoint;
					var secondLastMonthAxisPoint;

					if (labelsBetweenMonths.noLabels) {
						var j = 0;
						for (var i = 0; i < monthsToLabel.length; i++) {
							var month = months[monthsToLabel[i]];
							if ((year.monthData[month].minPixel > (year.minPixel + labelWidth / 2)) /*&& (year.monthData[month].minPixel < (year.maxPixel - labelWidth/2)) */ ) {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(year.monthData[month].minPixel, "line", STX.monthAsDisplay(month, false, this)));
								if (j > 0 && isLast) {
									secondLastMonthAxisPoint = {
										month: lastMonthAxisPoint.month,
										pixel: lastMonthAxisPoint.pixel
									}
								}
								lastMonthAxisPoint = {
									month: month,
									pixel: year.monthData[month].minPixel
								}
								j++;
							}
						}
					} else {
						var j = 0;
						for (var i = 0; i < monthsToLabel.length; i++) {
							var month = months[monthsToLabel[i]];
							if ((year.monthData[month].minPixel > (year.minPixel + labelWidth / 2)) /*&& (year.monthData[month].minPixel < (year.maxPixel - labelWidth/2))*/ ) {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(year.monthData[month].minPixel, "boundary", STX.monthAsDisplay(month, false, this)));
								if (j > 0 && isLast) {
									secondLastMonthAxisPoint = {
										month: lastMonthAxisPoint.month,
										pixel: lastMonthAxisPoint.pixel
									}
								}
								lastMonthAxisPoint = {
									month: month,
									pixel: year.monthData[month].minPixel
								}
								j++;
							}
							//if (labelsBetweenMonths.monthList[monthsToLabel[i]]) {
							dayAxisPoints = this.getDayAxisPoints(year.monthData[month], i == monthsToLabel.length - 1);
							axisRepresentation = axisRepresentation.concat(dayAxisPoints);
							//}
						}
					}

					if (secondLastMonthAxisPoint && lastMonthAxisPoint && isLast) {
						var pixelGap = lastMonthAxisPoint.pixel - secondLastMonthAxisPoint.pixel;
						var timeGap = lastMonthAxisPoint.month - secondLastMonthAxisPoint.month;
						if (timeGap < 0) timeGap += 12;
						var nextPointHz = lastMonthAxisPoint.pixel + pixelGap;
						var nextMonth = lastMonthAxisPoint.month + timeGap;
						while (nextPointHz < chart.width) {
							if (labelsBetweenMonths.noLabels) {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "line", STX.monthAsDisplay(nextMonth, false, this)));
							} else {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "boundary", STX.monthAsDisplay(nextMonth, false, this)));
							}
							nextPointHz += pixelGap;
							nextMonth += timeGap;
							if (nextMonth > 11) nextMonth -= 12;
						}


					} else if (lastMonthAxisPoint && isLast) { //edge case with only one axis point:


					}
				} else {
					dayAxisPoints = this.getDayAxisPoints(year.monthData[year.months[0]], true);
					axisRepresentation = axisRepresentation.concat(dayAxisPoints);
				}
				return axisRepresentation;
			}

			CIQ.ChartEngine.prototype.getDayAxisPoints = function (month, isLast) {
				if (!chart) chart = this.chart;
				var context = chart.context;
				var axisRepresentation = [];

				var labelWidth = context.measureText("00:00").width + 10; //10 extra for spacing
				var dataWidth = month.maxPixel - month.minPixel;
				var numLabels = Math.floor(dataWidth / labelWidth);

				if (numLabels == 0) return [];

				var days = month.days;

				if (days.length > 1) {
					var spacing = 1;
					if (days.length > numLabels) {
						spacing = days.length / (numLabels + 1);
					}

					var labelsBetweenDays = {
						noLabels: true,
						dayList: {}
					};

					// To make this neat, start at the middle month and then move up and down by spacing
					//var middleDay = Math.ceil(days.length / 2);

					var daysToLabel = [];
					/*for (var i = middleDay; i < days.length; i += spacing) {
						var day = days[i];
						//var prevMonth = months[i - 1];
						var dayWidth = month.dayData[day].maxPixel - month.dayData[day].minPixel;
						if ((dayWidth - labelWidth) > labelWidth && spacing == 1) {
							labelsBetweenDays.noLabels = false;
							labelsBetweenDays.dayList[i] = true;
						}
						daysToLabel.push(i);
					}
					for (var i = middleDay - spacing; i >= 0; i -= spacing) {
						var day = days[i];
						//var prevMonth = months[i - 1];
						var dayWidth = month.dayData[day].maxPixel - month.dayData[day].minPixel;
						if ((dayWidth - labelWidth) > labelWidth && spacing == 1) {
							labelsBetweenDays.noLabels = false;
							labelsBetweenDays.dayList[i] = true;
						}
						daysToLabel.unshift(i);
					}*/
					
					for (var i = 0; i < days.length; i += spacing) {
						var dayIndex = Math.round(i);
						if (dayIndex>=days.length) break;
						var day = days[dayIndex];
						//var prevMonth = months[i - 1];
						var dayWidth = month.dayData[day].maxPixel - month.dayData[day].minPixel;
						if (((dayWidth - labelWidth) > labelWidth || i == days.length-1) && spacing == 1) {
							labelsBetweenDays.noLabels = false;
							labelsBetweenDays.dayList[i] = true;
						}
						daysToLabel.push(dayIndex);
					}

					var lastDayAxisPoint;
					var secondLastDayAxisPoint;

					if (labelsBetweenDays.noLabels) {
						var j = 0;
						for (var i = 0; i < daysToLabel.length; i++) {
							var day = days[daysToLabel[i]];
							if ((month.dayData[day].minPixel > (month.minPixel + labelWidth / 2)) /*&& (year.monthData[month].minPixel < (year.maxPixel - labelWidth/2)) */ ) {
								var date = new Date(month.dayData[day].minTime);
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(month.dayData[day].minPixel, "line", date.getDate()));
								if (j > 0 && isLast) {
									secondLastDayAxisPoint = {
										day: lastDayAxisPoint.day,
										pixel: lastDayAxisPoint.pixel,
										date: lastDayAxisPoint.date
									}
								}
								lastDayAxisPoint = {
									day: day,
									pixel: month.dayData[day].minPixel,
									date: new Date(date.getFullYear(), date.getMonth(), date.getDate())
								}
								j++;
							}
						}
					} else {
						var j = 0;
						for (var i = 0; i < daysToLabel.length; i++) {
							var day = days[daysToLabel[i]];
							if ((month.dayData[day].minPixel > (month.minPixel + labelWidth / 2)) /*&& (year.monthData[month].minPixel < (year.maxPixel - labelWidth/2))*/ ) {

								var date = new Date(month.dayData[day].minTime);
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(month.dayData[day].minPixel, "boundary", (date.getMonth() + 1) + "/" + date.getDate()));
								if (j > 0 && isLast) {
									secondLastDayAxisPoint = {
										day: lastDayAxisPoint.day,
										pixel: lastDayAxisPoint.pixel,
										date: lastDayAxisPoint.date
									}
								}
								lastDayAxisPoint = {
									day: day,
									pixel: month.dayData[day].minPixel,
									date: new Date(date.getFullYear(), date.getMonth(), date.getDate())
								}
								j++;
							}
							//if (labelsBetweenMonths.monthList[monthsToLabel[i]]) {
							intraDayAxisPoints = this.getIntraDayAxisPoints(month.dayData[day], i == (daysToLabel.length - 1));
							axisRepresentation = axisRepresentation.concat(intraDayAxisPoints);
							//}
						}
					}

					if (secondLastDayAxisPoint && lastDayAxisPoint && isLast) {
						var pixelGap = lastDayAxisPoint.pixel - secondLastDayAxisPoint.pixel;
						var timeGap = lastDayAxisPoint.day - secondLastDayAxisPoint.day;
						var nextPointHz = lastDayAxisPoint.pixel + pixelGap;
						var nextDate = new Date(lastDayAxisPoint.date);
						nextDate.setDate(nextDate.getDate() + timeGap);
						while (nextPointHz < chart.width) {
							if (labelsBetweenDays.noLabels) {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "line", nextDate.getDate()));
							} else {
								axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(nextPointHz, "boundary", (nextDate.getMonth() + 1) + "/" + nextDate.getDate()));
							}
							nextPointHz += pixelGap;
							nextDate.setDate(nextDate.getDate() + timeGap);
						}


					} else if (lastDayAxisPoint && isLast) { //edge case with only one axis point:
						
					}
				} else {
					intraDayAxisPoints = this.getIntraDayAxisPoints(month.dayData[month.days[0]], true);
					axisRepresentation = axisRepresentation.concat(intraDayAxisPoints);
				}
				return axisRepresentation;
			}



			CIQ.ChartEngine.prototype.getIntraDayAxisPoints = function (day, isLast) {
				if (!chart) chart = this.chart;
				var context = chart.context;
				var axisRepresentation = [];

				var labelWidth = context.measureText("00:00").width + 10; //10 extra for spacing
				var dataWidth = day.maxPixel - day.minPixel;
				var timeSpan = day.maxTime - day.minTime;
				var pixelsPerMs = dataWidth / timeSpan;

				var numLabels = Math.floor(dataWidth / labelWidth);
				if (numLabels == 0 && !isLast) return [];

				if (numLabels == 0 && isLast) { // this deals with the one day case where no labels are drawn yet
					var maxTime = (chart.width - day.maxPixel) * pixelsPerMs + day.maxTime;
					if (maxTime - day.minTime > 86400000 || day.minPixel>labelWidth) return [];
					day.maxTime = maxTime;
					day.maxPixel = chart.width;
					dataWidth = day.maxPixel - day.minPixel;
					timeSpan = day.maxTime - day.minTime;
					numLabels = Math.floor(dataWidth / labelWidth);
				}

				
				var numMinutes = Math.floor(timeSpan / 60000);

				var goodMinuteInterval = [1, 5, 10, 15]; //and any multiple of 30

				var minutesPerLabel = Math.floor(numMinutes / numLabels);
				var minDate = new Date(day.minTime);

				var startMinute = minDate.getMinutes();

				if (minutesPerLabel <= 15) { // TODO: less than one minute intervals 
					for (var i = 0; i < goodMinuteInterval.length; i++) {
						if (minutesPerLabel < goodMinuteInterval[i]) {
							minutesPerLabel = goodMinuteInterval[i];
							break;
						}
					}
					while (startMinute%minutesPerLabel) {
						startMinute++;
					}
				} else { //make into multiples of 30
					var i = 30;
					while (true) {
						if (minutesPerLabel <= i) {
							minutesPerLabel = i;
							break;
						}
						i += 30;
					}
					if (startMinute>30) startMinute = 60;
					else if (startMinute>0) startMinute = 30;
					else startMinute = 0; 

				}

				minDate.setMinutes(startMinute);
				var axisTime = minDate.getTime();
				var axisPixel = day.minPixel + (axisTime - day.minTime) * pixelsPerMs;

				var pixelsPerLabel = pixelsPerMs * 60000 * minutesPerLabel;

				while ((isLast && (axisPixel < chart.width)) || (axisTime < day.maxTime)) {
					var axisDate = new Date(axisTime);
					var minute = axisDate.getMinutes();
					if (minute < 10) minute = '0' + minute;
					axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(axisPixel, "line", axisDate.getHours() + ":" + minute));
					axisTime += minutesPerLabel * 60000;
					axisPixel += pixelsPerLabel;
				}


				return axisRepresentation;


			}

		CIQ.ChartEngine.prototype.createTickXAxisWithDatesOld=function(chart){
			if(!chart) chart=this.chart;
			chart.xaxis=[];
			//console.log("");
			// These are all the possible time intervals. Not so easy to come up with a formula since time based switches
			// from 10 to 60 to 24 to 365
			if(!this.timeIntervalMap){
				this.timePossibilities=[STX.MILLISECOND,STX.SECOND,STX.MINUTE,STX.HOUR,STX.DAY,STX.MONTH,STX.YEAR];
				this.timeIntervalMap={};
				this.timeIntervalMap[STX.MILLISECOND]={
					arr: [1,2,5,10,20,50,100,250,500],
					minTimeUnit:0,
					maxTimeUnit:1000
				};
				this.timeIntervalMap[STX.SECOND]={
					arr: [1, 2, 5, 10,15,30],
					minTimeUnit: 0,
					maxTimeUnit: 60
				};
				this.timeIntervalMap[STX.MINUTE]={
					arr: [1,2,5,10,15,30],
					minTimeUnit: 0,
					maxTimeUnit: 60
				};
				this.timeIntervalMap[STX.HOUR]={
					arr: [1,2,3,4,6,12],
					minTimeUnit: 0,
					maxTimeUnit: 24
				};
				this.timeIntervalMap[STX.DAY]={
					arr: [1,2,7,14],
					minTimeUnit: 1,
					maxTimeUnit: 32
				};
				this.timeIntervalMap[STX.MONTH]={
					arr: [1,2,3,6],
					minTimeUnit:1,
					maxTimeUnit:13
				};
				this.timeIntervalMap[STX.YEAR]={
					arr: [1,2,3,5],
					minTimeUnit:1,
					maxTimeUnit:20000000
				};
				this.timeIntervalMap[STX.DECADE]={
					arr: [10],
					minTimeUnit: 0,
					maxTimeUnit: 2000000
				};
			}
			var daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];

			var periodicity=this.layout.periodicity;
			var interval=this.layout.interval;

			/* This section computes at which time interval we set the labels.*/
			var idealTickSizePixels=chart.xAxis.idealTickSizePixels?chart.xAxis.idealTickSizePixels:chart.xAxis.autoComputedTickSizePixels;
			var idealTicks=this.chart.width/idealTickSizePixels;
			for(var x=0;x<chart.dataSegment.length;x++) if(chart.dataSegment[x]) break; // find first valid bar in dataSegment
			// timeRange is the span of time in milliseconds across the dataSegment
			if(x==chart.dataSegment.length) return [];

			var timeRange = 0;
			if (interval === parseInt(interval, 10)) {
				timeRange = interval * periodicity * 60000 * chart.dataSegment.length;
			} else {
				timeRange=chart.dataSegment[chart.dataSegment.length-1].DT.getTime()-chart.dataSegment[x].DT.getTime(); // simple calc
			}
			var self=this;
			function millisecondsPerTick(){
				// get previous open
				var iter_parms = {
					'begin': new Date(),
					'interval': "day",
					'periodicity': 1,
					'inZone': this.dataZone,
					'outZone': this.dataZone
				};
				var iter = chart.market.newIterator(iter_parms);
				iter.next();
				var dt1 = iter.previous();

				// tick forward one tick
				iter = self.standardMarketIterator(dt1, null, chart);
				var dt2 = iter.next();
				return dt2.getTime()-dt1.getTime();
			}
			if(timeRange===0){
				timeRange = millisecondsPerTick() * chart.maxTicks; // If zero or one ticks displayed
			}else{
				timeRange=(timeRange/chart.dataSegment.length)*chart.maxTicks; // adjust timeRange in case dataSegment doesn't span entire chart (blank bars left or right of chart)
			}
			var msPerTick=timeRange/idealTicks;

			var i;
			// Find 1) the timePossibility which gives us the base time unit to iterate (for instance, SECONDS)
			// 2) Which timeIntervalMap. For instance the SECOND map allows 1,2,5,10,15,30 second increments
			for(i=0;i<this.timePossibilities.length;i++){
				if(this.timePossibilities[i]>msPerTick) break;
			}
			if(i===0){
				console.log("createTickXAxisWithDates: Assertion error. msPerTick < 1");
			}
			if(i==this.timePossibilities.length){ // In either of these cases, msPerTick will float through as simply timeRange/idealTicks
				i--;
			}else if(i>0){
				var prevUnit=this.timePossibilities[i-1];
				var prevMap=this.timeIntervalMap[prevUnit];
				var prevMultiplier=prevMap.arr[prevMap.arr.length-1];
				// Find the *closest* time possibility
				if(msPerTick-(prevUnit*prevMultiplier)<this.timePossibilities[i]-msPerTick)
					i--;
			}

			var timeUnit=this.timePossibilities[i];
			if(chart.xAxis.timeUnit) timeUnit=chart.xAxis.timeUnit;
			chart.xAxis.activeTimeUnit=timeUnit; // for reference when drawing the floating label. So we know the precision we need to display.

			var timeInterval=STX.clone(this.timeIntervalMap[timeUnit]);

			// Now, find the right time unit multiplier
			for(i=0;i<timeInterval.arr.length;i++){
				if(timeInterval.arr[i]*timeUnit>msPerTick) break;
			}
			if(i==timeInterval.arr.length){
				i--;
			}else{
				// Find the *closest* interval
				if(msPerTick-timeInterval.arr[i-1]*timeUnit<timeInterval.arr[i]*timeUnit-msPerTick)
					i--;
			}
			var timeUnitMultiplier=timeInterval.arr[i];
			if(chart.xAxis.timeUnitMultiplier) timeUnitMultiplier=chart.xAxis.timeUnitMultiplier;

			//end TODO

			var axisRepresentation=[];

			for(i=0;i<=chart.maxTicks;i++){
				if(chart.dataSegment[i]) break;
			}
			// TODO, The problem with doing this here is that for non-timebased charts, we don't yet know how much time we're displaying, so we don't know
			// relatively how far into the past we should go. It would be better to do this after we've calculated the amount of time occupied by the data
			// and then, figure out an appropriate spacing for which to count back in time (this current code merely uses the current interval)
			if(i>0 && i<chart.maxTicks){
				var iter1=this.standardMarketIterator(chart.dataSegment[i].DT,chart.xAxis.adjustTimeZone?this.displayZone:this.dataZone);
				for(var j=i;j>0;j--){
					var dt=iter1.previous();
					chart.xaxis.unshift({
						DT: dt,
						Date: STX.yyyymmddhhmmssmmm(dt) // todo, this is inefficient
					});
				}
			}

			var dtShifted=0;
			var nextTimeUnit=timeInterval.minTimeUnit;
			var previousTimeUnitLarge=-1;	// this will be used to keep track of when the next time unit up loops over
			var firstTick=true;
			var candleWidth=this.layout.candleWidth;

			//TODO, again instead of using the standard interval, use a calculated interval based on how much chart time
			//is being taken up
			var iter=this.standardMarketIterator(chart.dataSegment[chart.dataSegment.length-1].DT,chart.xAxis.adjustTimeZone?this.displayZone:this.dataZone);
			for(i;i<chart.maxTicks;i++){
				if(i<chart.dataSegment.length){
					var prices=chart.dataSegment[i];
					if(prices.displayDate && chart.xAxis.adjustTimeZone/* && timeUnit<STX.DAY*/){
						dtShifted=prices.displayDate;
					}else{
						dtShifted=prices.DT;
					}
					if(i && prices.leftOffset) candleWidth=(prices.leftOffset-prices.candleWidth/2)/i;
				}else{
					if(!chart.xAxis.futureTicks) break;
					dtShifted = iter.next();
				}
				var obj={
						DT: dtShifted,
						Date: STX.yyyymmddhhmmssmmm(dtShifted) // todo, this is inefficient
					};
				if(i<chart.dataSegment.length) obj.data=chart.dataSegment[i];	// xaxis should have reference to data to generate a head's up
				else obj.data=null;
				chart.xaxis.push(obj);

				var currentTimeUnit, currentTimeUnitLarge;
				if(timeUnit==STX.MILLISECOND){
					currentTimeUnit=dtShifted.getMilliseconds();
					currentTimeUnitLarge=dtShifted.getSeconds();
				}else if(timeUnit==STX.SECOND){
					currentTimeUnit=dtShifted.getSeconds();
					currentTimeUnitLarge=dtShifted.getMinutes();
				}else if(timeUnit==STX.MINUTE){
					currentTimeUnit=dtShifted.getMinutes();
					currentTimeUnitLarge=dtShifted.getHours();
				}else if(timeUnit==STX.HOUR){
					currentTimeUnit=dtShifted.getHours()+dtShifted.getMinutes()/60;
					currentTimeUnitLarge=dtShifted.getDate();
				}else if(timeUnit==STX.DAY){
					currentTimeUnit=dtShifted.getDate(); // TODO, get day of year
					currentTimeUnitLarge=dtShifted.getMonth()+1;
				}else if(timeUnit==STX.MONTH){
					currentTimeUnit=dtShifted.getMonth()+1;
					currentTimeUnitLarge=dtShifted.getFullYear();
				}else if(timeUnit==STX.YEAR){
					currentTimeUnit=dtShifted.getFullYear();
					currentTimeUnitLarge=dtShifted.getFullYear()+1000;
				}else{
					currentTimeUnit=dtShifted.getFullYear();
					currentTimeUnitLarge=0;
				}

				var text=null;
				var hz;
				if(previousTimeUnitLarge!=currentTimeUnitLarge){
					if(currentTimeUnit<=nextTimeUnit){ // case where we skipped ahead to the next large time unit
						nextTimeUnit=timeInterval.minTimeUnit;
					}
					// print a boundary
					hz=chart.left+(i*candleWidth)-1;
					text=null;
					if(timeUnit==STX.HOUR || (timeUnit==STX.MINUTE && previousTimeUnitLarge>currentTimeUnitLarge)){
						if(chart.xAxis.formatter){
							text=chart.xAxis.formatter(dtShifted, "boundary", STX.DAY, 1);
						}else{
							if(this.internationalizer){
								text=this.internationalizer.monthDay.format(dtShifted);
							}else{
								text=(dtShifted.getMonth()+1) + "/" + dtShifted.getDate();
							}
						}
					}else if(timeUnit==STX.DAY){
						if(previousTimeUnitLarge>currentTimeUnitLarge){ // year shift
							text=dtShifted.getFullYear();
						}else{
							text=STX.monthAsDisplay(dtShifted.getMonth(),false,this);
						}
					}else if(timeUnit==STX.MONTH){
						text=dtShifted.getFullYear();
					}
					if(text && previousTimeUnitLarge!=-1){
						axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"boundary",text));
					}
				}
				//console.log("currentTimeUnit=" + currentTimeUnit + " nextTimeUnit=" + nextTimeUnit + " minTimeUnit=" + timeInterval.minTimeUnit + " currentTimeUnitLarge=" + currentTimeUnitLarge + " previousTimeUnitLarge=" + previousTimeUnitLarge);
				if(currentTimeUnit>=nextTimeUnit){ //passed the next expected axis label so let's print the label
					if(nextTimeUnit==timeInterval.minTimeUnit){
						if(currentTimeUnitLarge==previousTimeUnitLarge) continue; // we haven't looped back to zero yet
					}

					var labelDate=new Date(dtShifted);
					hz=chart.left+((2*i+1)*candleWidth)/2-1;
					var boundaryTimeUnit=Math.floor(currentTimeUnit/timeUnitMultiplier)*timeUnitMultiplier;
					if(boundaryTimeUnit<currentTimeUnit){
						if(this.layout.interval=="week") boundaryTimeUnit=currentTimeUnit;
						else hz-=candleWidth/4; // if we don't land on a label then position the label to the left of the bar; could be more accurate
					}
					// And print the boundary label rather than the actual date
					if(timeUnit==STX.MILLISECOND){
						labelDate.setMilliseconds(boundaryTimeUnit);
					}else if(timeUnit==STX.SECOND){
						labelDate.setMilliseconds(0);
						labelDate.setSeconds(boundaryTimeUnit);
					}else if(timeUnit==STX.MINUTE){
						labelDate.setMilliseconds(0);
						labelDate.setSeconds(0);
						labelDate.setMinutes(boundaryTimeUnit);
					}else if(timeUnit==STX.HOUR){
						labelDate.setMilliseconds(0);
						labelDate.setSeconds(0);
						labelDate.setMinutes(0);
						labelDate.setHours(boundaryTimeUnit);
					}else if(timeUnit==STX.DAY){
						labelDate.setDate(Math.max(1,boundaryTimeUnit)); //TODO, day of year
					}else if(timeUnit==STX.MONTH){
						labelDate.setDate(1);
						labelDate.setMonth(boundaryTimeUnit-1);
					}else if(timeUnit==STX.YEAR){
						labelDate.setDate(1);
						labelDate.setMonth(0);
						//labelDate.setFullYear(boundaryTimeUnit);
					}else{
						labelDate.setDate(1);
						labelDate.setMonth(0);
						//labelDate.setFullYear(boundaryTimeUnit);
					}
					//console.log(labelDate + " boundary=" + boundaryTimeUnit);

					// figure the next expected axis label position
					nextTimeUnit=boundaryTimeUnit+timeUnitMultiplier;
					if(timeUnit==STX.DAY) timeInterval.maxTimeUnit=daysInMonth[labelDate.getMonth()]+1; // DAY is the only unit with a variable max
					if(nextTimeUnit>=timeInterval.maxTimeUnit) nextTimeUnit=timeInterval.minTimeUnit;
					previousTimeUnitLarge=currentTimeUnitLarge;

					// Don't print the first tick unless it lands exactly on a boundary. Otherwise the default logic assumes
					// that the boundary was skipped.
					if(firstTick && boundaryTimeUnit<currentTimeUnit) continue;

					// format the label
					if(chart.xAxis.formatter){
						text=chart.xAxis.formatter(labelDate, "line", timeUnit, timeUnitMultiplier);
					}else{
						if(timeUnit==STX.DAY){
							text=labelDate.getDate();
							/*if(this.internationalizer){
								text=this.internationalizer.monthDay.format(labelDate);
							}else{
								text=(labelDate.getMonth()+1) + "/" + labelDate.getDate();
							}*/
						}else if(timeUnit==STX.MONTH){
							text=STX.monthAsDisplay(dtShifted.getMonth(),false,this);
						}else if(timeUnit==STX.YEAR || timeUnit==STX.DECADE){
							text=labelDate.getFullYear();
						}else{
							text=STX.timeAsDisplay(labelDate, this, timeUnit);
						}
					}
					axisRepresentation.push(new CIQ.ChartEngine.XAxisLabel(hz,"line",text));
				}
				firstTick=false;
			}
			return axisRepresentation;
		};