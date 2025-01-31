import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "./socket";

function Room() {
  const [roomName, setRoomName] = useState("");
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/room/${id}`, { mode: "cors" })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setRoomName(res.room_name);
      })
      .catch((error) => console.error(error));
    const localUser = localStorage.getItem("user");
    if (localUser) {
      setUser(localUser);
      setUserName(localUser);
    }
  }, [user]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat-message");
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message.trim() === "") return;

    // const msgData = {
    //     user: username, // Dodajemo ime korisnika
    //     text: message,
    //     timestamp: new Date().toLocaleTimeString(), // Dodajemo vreme slanja
    // };

    socket.emit("chat-message", message); // Šaljemo poruku serveru
    setMessage("");
    console.log(messages);
  };

  const enterUser = (event) => {
    event.preventDefault();
    if (userName.trim() === "") return;
    localStorage.setItem("user", userName);
    setUser(userName);
  };
  if (!user) {
    return (
      <div>
        <h1>Enter user name:</h1>
        <form onSubmit={enterUser}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Name:"
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  } else if (user && roomName != "") {
    return (
      <div>
        <h1>Room name: {roomName}</h1>
        <h2>Hello {user}</h2>
        <h2>Chat</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg, index) => (
            <li
              key={index}
              style={{
                // textAlign: msg.user === username ? "right" : "left",
                // background: msg.user === username ? "#DCF8C6" : "#EAEAEA",
                padding: "8px",
                margin: "4px",
                borderRadius: "8px",
                maxWidth: "70%",
                display: "inline-block",
              }}
            >
              <strong>user</strong>: {msg}
              <br />
              <small style={{ fontSize: "10px", color: "gray" }}>
                {msg.timestamp}
              </small>
            </li>
          ))}
        </ul>
        <form onSubmit={sendMessage}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={1}
          ></textarea>
          <button type="submit">Send message</button>
        </form>
      </div>
    );
  } else {
    return (
      <div>
        <h1>This room does not exist or time expired</h1>
      </div>
    );
  }
}

export default Room;
