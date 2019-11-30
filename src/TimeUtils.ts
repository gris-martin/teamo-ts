import getLanguageResource from "./LanguageResource";

export const secToMs = 1000;
export const minToMs = secToMs * 60;
export const hourToMs = minToMs * 60;
export const dayToMs = hourToMs * 24;

// Get the desired time (from Date object) as a string
// returns: hh:mm:ss if showSeconds is true, hh:mm otherwise
export function getTimeString(date: Date, showSeconds: boolean = false, showDay: boolean = false) {
    const timeArray = date.toTimeString().split(" ")[0].split(":");
    let timeString = `${timeArray[0]}:${timeArray[1]}`
    if (showSeconds) timeString += `:${timeArray[2]}`;
    if (showDay) timeString += ` ${isToday(date) ? getLanguageResource("TODAY") : getLanguageResource("TOMORROW")}`;
    return timeString;
}

// Return string of the form '[hh] h [mm] min'
export const getWaitTimeString = (date: Date) => `${Math.floor(getWaitTimeH(date))} h ${Math.floor(getWaitTimeMin(date))} min`;

// Get the current time as a string
// See getTimeString for format
export function getCurrentTimeString(showSeconds: boolean = false) {
    return getTimeString(new Date(), showSeconds);
}

// Get the Date object corresponding to the next time the clock will
// be the inputted time
// Examples:
//      Current time == 13.00; hh == 13; mm == 30 will yield
//      a Date object pointing to 13.30 today
//
//      Current time == 13.00; hh == 12; mm == 15 will yield
//      a Date object pointing to 12.15 tomorrow 
export function getAdjustedDate(hh: number, mm: number): Date {
    let currentDate = new Date();
    let playDate = new Date();
    playDate.setHours(hh);
    playDate.setMinutes(mm);
    playDate.setSeconds(0);
    if (playDate.getTime() < currentDate.getTime())
        playDate.setTime(playDate.getTime() + dayToMs);
    return playDate;
}

// Get the time between the current date and the input date in ms
export function getWaitTimeMs(date: Date) {
    let waitTime = date.valueOf() - Date.now();
    if (waitTime < 0) {
        console.trace("Tried to get the time until a Date that has already passed. Returning 0");
        return 0;
    }
    return waitTime;
}

// Get the time between the current date and the input date in hours
const getWaitTimeH = (date: Date) => getWaitTimeMs(date) / (hourToMs);

// Get the time between the current date and the input date in minutes
const getWaitTimeMin = (date: Date) => Math.floor((getWaitTimeH(date) - Math.floor(getWaitTimeH(date))) * 60);

// Return true if the date is today
const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
}
