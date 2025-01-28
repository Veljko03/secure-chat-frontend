import { useState } from "react";

function App() {
  const [link, setLink] = useState("somelink");
  const [roomName, setRoomName] = useState("");

  function generateLink() {
    if (roomName == "") {
      alert("set room name");
    }
    console.log(roomName);
    fetch(`http://localhost:3000`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
    })
      .then((response) => {
        if (!response.ok) {
          alert("Invalid credentials");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log(data);
        } else {
          throw new Error("Login failed: no token provided");
        }
      })
      .catch((err) => console.log(err));
    if (link == "somelink") setLink(Math.random(100));
  }

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
    <div>
      <h1>heloo</h1>
      <h3>here you can generate link</h3>
      <form onSubmit={generateLink} action="">
        <h3>Private room name:</h3>
        <input
          type="text"
          placeholder="Room Name"
          required
          minLength={3}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <br />
        <br />
        <input type="text" required readOnly value={link} />

        <button>Click to generate</button>
      </form>

      <br />
      <button onClick={copyLink}>copy</button>
    </div>
  );
}

export default App;
