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

export default App
