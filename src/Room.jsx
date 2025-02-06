import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "./socket";
import TimeLeft from "./TimeLeft";

function Room() {
  const [roomName, setRoomName] = useState("");
  const [room, setRoom] = useState(null);
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3000/room/${id}`, { mode: "cors" })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setRoomName(res.room_name);
        setRoom(res);
      })
      .catch((error) => console.error(error));
    const localUser = JSON.parse(localStorage.getItem(`user_${id}`));
    if (localUser) {
      console.log(localUser, " local user");

      setUser(localUser);
      if (socket.connected) {
        socket.disconnect();
      }

      socket.auth = {
        serverOffset: 0,
        roomId: localUser.roomId,
      };
      socket.connect();
    }
  }, []);

  useEffect(() => {
    console.log(socket.auth.roomId, " socke room id");

    function onConnect() {
      setIsConnected(true);
      // if (user) {
      //   socket.auth.roomId = user.room_id;
      // }
    }

    function onDisconnect() {
      setIsConnected(false);
    }
    console.log("da li udje ovde uopste");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", (msg, serverOffset) => {
      console.log("chat message ", msg);

      if (messages.find((ex) => ex.id == msg.id)) return;
      const date = new Date(msg.timestamp);
      const formattedDate = date.toLocaleString("sr-RS", {
        // year: "numeric",
        // month: "2-digit",
        // day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      msg.timestamp = formattedDate;

      setMessages((prevMessages) => [...prevMessages, msg]);
      socket.auth.serverOffset = serverOffset;
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

    const msgData = {
      userId: user.userId,
      text: message,
      roomId: user.roomId,
    };

    socket.emit("chat-message", msgData);
    setMessage("");
  };

  const enterUser = (event) => {
    event.preventDefault();
    if (userName.trim() === "") return;
    console.log("udje ovde");

    fetch(`http://localhost:3000/room/${id}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName }),
    })
      .then((response) => response.json())
      .then((res) => {
        const user = { userName, userId: res.user_id, roomId: res.room_id };
        localStorage.setItem(`user_${id}`, JSON.stringify(user));
        setUser(user);
        if (socket.connected) {
          socket.disconnect();
        }

        socket.auth = {
          serverOffset: 0,
          roomId: user.roomId, // Postavi roomId pre povezivanja
        };
        socket.connect();
      })
      .catch((error) => console.error(error));
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
        <h2>Hello {user.userName}</h2>
        <h2>Chat</h2>
        <TimeLeft room={room} />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {messages.map((msg, index) => (
            <li
              key={index}
              style={{
                textAlign: msg.username === user.userName ? "right" : "left",
                background:
                  msg.username === user.userName ? "#DCF8C6" : "#EAEAEA",
                padding: "8px",
                margin: "4px",
                borderRadius: "8px",
                maxWidth: "70%",
                display: "inline-block",
              }}
            >
              <strong>{msg.username}</strong>: {msg.content}
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
