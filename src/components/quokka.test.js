//they already set the days as numbers!!!

// const daysOfTheWeek = [
// 	"Sunday",
// 	"Monday",
// 	"Tuesday",
// 	"Wednesday",
// 	"Thursday",
// 	"Friday",
// 	"Saturday"
// ];

const config = {
	day: 4,
	hour: 15,
	minute: 1
};

// work out how many days until shutdown
const daysUntilShutdown = (restartDay, today) => {
	const shutdownIsToday = restartDay - today === 0;
	const shutdownIsNextWeek = restartDay - today < 0;

	if (shutdownIsToday) {
		return 0;
	} else if (shutdownIsNextWeek) {
		// 6 is how many full days until the same day next week
		return restartDay - today + 6; /*?*/
	} else {
		// shutdown day is coming up soon this week
		return restartDay - today; /*?*/
	}
};

const timeInMsToShutdown = (shutdownTime, now) => {
	// ensure the time has not passed
	if (shutdownTime - now < 0) {
		//if the time has passed then set the day to next week (same day)
		shutdownTime.setDate(shutdownTime.getDate() + 7);
	}
	return shutdownTime - now;
};

const now = new Date(); /*?*/

const shutdownTime = new Date();
// using days to set the date for shutdown
shutdownTime.setDate(
	now.getDate() + daysUntilShutdown(config.day, now.getDay())
);
shutdownTime.setHours(config.hour);
shutdownTime.setMinutes(config.minute);

setTimeout(() => {
	console.log("shutting down now");
}, timeInMsToShutdown(shutdownTime, now));

// const hrs = (timeUntilShutdown / (1000 * 60 * 60)).toFixed(1);
// hrs;

// =========================
// const isTimeToShutdown = () => {
//   const dateNow = new Date();

//   const daysOfTheWeek = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday"
//   ];

//   const today = daysOfTheWeek[dateNow.getDay()].toLowerCase();
//   const hourNow = dateNow.getHours();
//   const minutesNow = dateNow.getMinutes();

//   const config = {
//     day: "Wednesday",
//     hour: 17,
//     minutes: 59
//   };

//   return config.day.toLowerCase() === today &&
//   Number(config.hour) === hourNow &&
//   Number(config.minutes) === minutesNow
//     ? true
//     : false;
// };

// const shutdownFinsemble = () => console.log("shutting down");

// const checkTime = () => {
//   console.log('checking to see if I need to shutdown')
//   setTimeout(() => {
//     isTimeToShutdown() ? shutdownFinsemble() : checkTime();
//   }, 20000);
// };

// checkTime();
