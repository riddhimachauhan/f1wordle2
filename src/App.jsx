import React, { useState, useEffect, useCallback } from "react";

const DAILY_WORDS = [
  "PITSTOP", "DRIVERS", "RACING", "TYRE", "PODIUM", "ENGINE",
  "CHAMPION", "LAPTIME", "VERSTAPPEN", "FERRARI", "MCLAREN",
  "LANDO", "LECLERC", "PIASTRI"
];

const COLORS = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
  empty: "#121213",
};

function getTodayWord() {
  const start = new Date(2025, 0, 1).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return DAILY_WORDS[diffDays % DAILY_WORDS.length];
}

function getTodayDateString() {
  return new Date().toISOString().split("T")[0];
}

export default function F1Wordle() {
  const todayWord = getTodayWord();
  const wordLength = todayWord.length;
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("f1wordle_streak") || "0"));
  const [largestStreak, setLargestStreak] = useState(() => parseInt(localStorage.getItem("f1wordle_largest_streak") || "0"));
  const [lastPlayDate, setLastPlayDate] = useState(() => localStorage.getItem("f1wordle_last_play_date") || "");
  const [showLongestStreak, setShowLongestStreak] = useState(false);

  const gameOver = guesses.length === 6 && !solved;

  // 🔥 Handle solved case
  useEffect(() => {
    if (solved) {
      const today = getTodayDateString();
      if (lastPlayDate === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const newStreak = lastPlayDate === yesterdayStr ? streak + 1 : 1;
      setStreak(newStreak);
      setLastPlayDate(today);
      localStorage.setItem("f1wordle_streak", newStreak.toString());
      localStorage.setItem("f1wordle_last_play_date", today);

      if (newStreak > largestStreak) {
        setLargestStreak(newStreak);
        localStorage.setItem("f1wordle_largest_streak", newStreak.toString());
      }
    }
  }, [solved]);

  // 🔥 Handle loss
  useEffect(() => {
    if (gameOver && !solved && lastPlayDate !== getTodayDateString()) {
      setStreak(0);
      localStorage.setItem("f1wordle_streak", "0");
      const today = getTodayDateString();
      localStorage.setItem("f1wordle_last_play_date", today);
      setLastPlayDate(today);
    }
  }, [gameOver, solved]);

  function checkGuess(guess) {
    const result = [];
    const target = todayWord.split("");
    const guessArr = guess.split("");
    const letterCount = {};

    target.forEach((l) => (letterCount[l] = (letterCount[l] || 0) + 1));
    guessArr.forEach((l, i) => {
      if (l === target[i]) {
        result[i] = "correct";
        letterCount[l] -= 1;
      }
    });
    guessArr.forEach((l, i) => {
      if (result[i]) return;
      if (letterCount[l] > 0) {
        result[i] = "present";
        letterCount[l] -= 1;
      } else {
        result[i] = "absent";
      }
    });
    return result;
  }

  function handleSubmit() {
    if (solved || currentGuess.length !== wordLength) return;
    const guessUpper = currentGuess.toUpperCase();
    const feedback = checkGuess(guessUpper);
    const newGuesses = [...guesses, { word: guessUpper, feedback }];
    setGuesses(newGuesses);
    setCurrentGuess("");
    if (guessUpper === todayWord) setSolved(true);
  }

  const onKeyDown = useCallback((event) => {
    if (solved) return;
    const key = event.key;
    if (key === "Backspace") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key === "Enter") {
      if (currentGuess.length === wordLength) handleSubmit();
    } else if (/^[a-zA-Z]$/.test(key)) {
      setCurrentGuess((prev) => (prev.length < wordLength ? prev + key.toUpperCase() : prev));
    }
  }, [currentGuess, solved]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  function handleShowLongestStreak() {
    setShowLongestStreak(true);
  }

  let fireColor = solved ? "#4caf50" : streak > 0 ? "orange" : "#000";

  return (
    <div className="container" tabIndex={-1}>
      <header>
        <h1>F1 Wordle</h1>
        <div
          className="fire-icon"
          title={`Current Streak: ${streak}`}
          onClick={handleShowLongestStreak}
          style={{ color: fireColor, fontSize: "2rem", cursor: "pointer" }}
        >
          🔥
        </div>
      </header>

      <div className="board" aria-label="Wordle board">
        {guesses.map(({ word, feedback }, i) => (
          <div key={i} className="row">
            {word.split("").map((letter, j) => (
              <div key={j} className="cell" style={{ backgroundColor: COLORS[feedback[j]] }}>
                {letter}
              </div>
            ))}
          </div>
        ))}

        {!gameOver &&
          Array.from({ length: 6 - guesses.length }, (_, i) => i + guesses.length).map((i, index) => (
            <div key={i} className="row">
              {Array.from({ length: wordLength }).map((_, j) => {
                const char = index === 0 && j < currentGuess.length ? currentGuess[j] : "";
                return (
                  <div
                    key={j}
                    className="cell empty"
                    style={{ borderColor: index === 0 ? "#888" : "#555" }}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {gameOver && (
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "2rem", color: "red" }}>
          <p>Today's word was:</p>
          <p style={{ fontSize: "3rem", letterSpacing: "0.1em", color: "orange" }}>{todayWord}</p>
          <p style={{ fontSize: "1.5rem", marginTop: "1rem" }}>Try again tomorrow!</p>
        </div>
      )}

      {showLongestStreak && (
        <p style={{ marginTop: "1rem", fontSize: "1.2rem", color: "#007bff", textAlign: "center" }}>
          🔥 Your longest streak is: {largestStreak}
        </p>
      )}
C:\Users\ridds\Desktop\f1 wordle\f1-wordle
    </div>
  );
}
