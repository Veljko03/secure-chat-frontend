import { useState, useEffect } from "react";

function TimeLeft({ room }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    console.log("room, ", room);

    if (room) {
      const expiresIn = new Date(room.expiration_in).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diff = expiresIn - now;
        console.log(diff, "diff");

        if (diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0 });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });
      };

      updateTimer();
      const interval = setInterval(updateTimer, 10000); // Update every second

      return () => clearInterval(interval);
    }
  }, [room]);

  return (
    <div className="timerSection">
      <h1 className="timer">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}min
      </h1>
      <h3 className="timerMessage">
        Room will be destroyed after this time expires
      </h3>
    </div>
  );
}

export default TimeLeft;
