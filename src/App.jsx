import { useState } from "react";

function App() {
  const [link, setLink] = useState("Link will be displayed here");
  const [roomName, setRoomName] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);

  const generateLink = (event) => {
    event.preventDefault();
    if (roomName == "") {
      alert("set room name");
    }
    console.log(roomName);
    fetch(`http://localhost:3000`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName, expiresIn }),
    })
      .then((response) => {
        if (!response.ok) {
          alert("Invalid credentials");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          const URL = data.url;
          setLink(`http://localhost:5173/room/${URL}`);
        } else {
          throw new Error("Login failed: no token provided");
        }
      })
      .catch((err) => console.log(err));
  };

  function copyLink() {
    if (link != "") {
      navigator.clipboard.writeText(link);

      // Alert the copied text
      alert("Copied the link: " + link);
    } else {
      alert("firstly generate link");
    }
  }
  return (
    <div className="mainPageContainer">
      <div className="title">
        <h1>Create a private chat room in seconds!</h1>
        <h3>
          No hassle choose a name, set a duration, and generate a link. The
          perfect tool for short-term, secure communication.
        </h3>
      </div>
      <div className="secondCon">
        <div className="formSection">
          <h3>Enter the room name and duration in hours</h3>
          <form className="createRoomForm" onSubmit={generateLink}>
            <input
              type="text"
              placeholder="Room Name"
              required
              minLength={3}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Min before destory"
              required
              min={1}
              max={999}
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            />

            <button>Click to generate</button>
          </form>
          <div className="goTo">
            <input
              className="link"
              type="text"
              required
              readOnly
              value={link}
            />
            <button className="btn-copy" onClick={copyLink}>
              Copy
            </button>
          </div>
          <p></p>
        </div>
        <div className="checkPoints">
          <ul>
            <li>
              <strong>Guaranteed Privacy:</strong> Rooms automatically
              self-destruct after the timer ends.
            </li>
            <li>
              <strong>Fast and Easy</strong> Start chatting in just a few
              clicks.
            </li>
            <li>
              <strong>No Registration Required</strong> Focus on the
              conversation, not on forms
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
