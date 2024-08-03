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
      <button onClick={showScheduleSetter} className='setup'>Set up a notification schedule</button>
      <div className='schedular-inputs hide'>
        <input type="time" id='startTime' placeholder='Enter Start Time' />
        <input type="time" id='endTime' placeholder='Enter Enter Time' />
        <input type="number" id='interval' placeholder='Enter Notification Interval'/>
        <button onClick={setSchedule}>Save</button>
      </div>
    </>
  )
}

function setSchedule(){
  let startEl: any = document.getElementById('startTime');
  let startTime, endTime, interval:any;
  if(startEl){
    startTime = startEl.value;
  }
  let endEl: any = document.getElementById('endTime');
  if(endEl){
    endTime = endEl.value;
  }
  let intervalEl: any = document.getElementById('interval');
  if(intervalEl){
    interval = parseInt(intervalEl.value);
  }

  window.api.schedule(startTime,endTime,interval);
  document.getElementsByClassName('schedular-inputs')[0].classList.toggle('hide');
}

function showScheduleSetter(){
  document.getElementsByClassName('schedular-inputs')[0].classList.toggle('hide');
  document.getElementsByClassName('setup')[0].classList.toggle('hide');
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
  if (notifyTime !="No Notifications Scheduled"){


  }
},1000);

// type declarations
declare global {
  interface Window {
    api: {
      notify: (title: string, message: string) => void;
      getNextNotifyTime: () => string;
      schedule: (startTime: string, endTime: string, interval: number) => void;
    };
  }
}

export default App
