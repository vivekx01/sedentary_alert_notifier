import './App.css'

var notifyTime: string;
function App() {
  return (
    <>
      <div className="time">
        <h3>The Current Time is: </h3>
        <div id="clock"></div>
      </div>
      <h4>The Next Sedentary Alert will be at: {notifyTime}</h4>
    </>
  )
}

// keeps showing time to the user
function updateTime() {
  const clockElement: any = document.getElementById('clock');
  const now = new Date();
  if (clockElement) clockElement.textContent = now.toLocaleTimeString();
  return now.toLocaleTimeString()
}
setInterval(updateTime, 1000);
setInterval(async function () {
  notifyTime = await window.api.getNextNotifyTime();
  document.getElementsByTagName('h4')[0].innerHTML = `The Next Sedentary Alert will be at: ${notifyTime}`
},1000);

// type declarations
declare global {
  interface Window {
    api: {
      notify: (title: string, message: string) => void;
      getNextNotifyTime: () => string;
    };
  }
}

// setInterval(() => {
//   if (!notifyTime) return;
//   const currentTime = updateTime();
//   if (currentTime === notifyTime) {
//     showNotification();
//     notifyTime = addMinutesToTime(notifyTime, 30);
//     document.getElementsByTagName('h4')[0].innerHTML = `The Next Sedentary Alert will be at: ${notifyTime}`
//     console.log("The new notify time is: ", notifyTime);
//   }
// }, 1000);


// function calculateNextNotifyTime(): string {
//   const currentTime = updateTime(); // Get the current time
//   if (currentTime) {
//     const [currentHour, currentMinute, currentSecond] = currentTime.split(':').map(Number);
//     const currentDate = new Date();
//     currentDate.setHours(currentHour, currentMinute, currentSecond, 0);
//     let nextNotifyTime: Date;
//     // Determine the next notify time based on the current time
//     if (currentMinute < 30) {
//       // If current time is less than 30 minutes past the hour, set to the next half hour
//       nextNotifyTime = new Date(currentDate.setMinutes(30, 0, 0));
//     } else {
//       // If current time is greater than or equal to 30 minutes past the hour, set to the next hour
//       nextNotifyTime = new Date(currentDate.setHours(currentHour + 1, 0, 0, 0));
//     }
//     return nextNotifyTime.toLocaleTimeString('en-US', { hour12: false });
//   }
//   else{
//     return 'Cannot calculate next notify time';
//   }
// }

// function addMinutesToTime(time: string, minutes: number): string {
//   const [hours, mins, secs] = time.split(':').map(Number);
//   const date = new Date();
//   date.setHours(hours);
//   date.setMinutes(mins + minutes);
//   date.setSeconds(secs);

//   const newHours = String(date.getHours()).padStart(2, '0');
//   const newMinutes = String(date.getMinutes()).padStart(2, '0');
//   const newSeconds = String(date.getSeconds()).padStart(2, '0');

//   return `${newHours}:${newMinutes}:${newSeconds}`;
// }

// function showNotification() {
//   window.api.notify("Sedentary Alert", "Its the time to get up and walk")
// }

export default App
