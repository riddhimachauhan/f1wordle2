import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
function handleClick() {
  console.log("Button clicked");
}
const today = new Date().toDateString(); // just the date part
const lastPlayed = localStorage.getItem("f1wordle_last_played");

useEffect(() => {
  if (lastPlayed !== today) {
    // If the player is playing a new day, reset streak unless solved
    localStorage.setItem("f1wordle_streak", "0");
    setStreak(0);
  }
}, []);

useEffect(() => {
  if (solved) {
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("f1wordle_streak", newStreak.toString());
    localStorage.setItem("f1wordle_last_played", today);

    if (newStreak > largestStreak) {
      setLargestStreak(newStreak);
      localStorage.setItem("f1wordle_largest_streak", newStreak.toString());
    }
  }
}, [solved]);
localStorage.removeItem("f1wordle_streak");
localStorage.removeItem("f1wordle_last_play_date");
localStorage.removeItem("f1wordle_largest_streak");

