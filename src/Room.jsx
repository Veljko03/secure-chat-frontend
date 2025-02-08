import { useEffect, useRef, useState } from "react";
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
  const listRef = useRef(null);

  const API_URL = import.meta.env.VITE_BACKEND_APP_API_URL;

  useEffect(() => {
    //3️⃣ bring the last item into view
    listRef.current?.lastElementChild?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    fetch(`${API_URL}/room/${id}`, {
      mode: "cors",
    })
      .then((response) => response.json())
      .then((res) => {
        setRoomName(res.room_name);
        setRoom(res);
      })
      .catch((error) => console.error(error));
    const localUser = JSON.parse(localStorage.getItem(`user_${id}`));
    if (localUser) {
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
    function onConnect() {
      setIsConnected(true);
      // if (user) {
      //   socket.auth.roomId = user.room_id;
      // }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat-message", (msg, serverOffset) => {
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

  function copyLink() {
    const url = window.location.href;

    navigator.clipboard.writeText(url);

    // Alert the copied text
    alert("Copied the link: " + url);
  }

  const enterUser = (event) => {
    event.preventDefault();
    if (userName.trim() === "") return;

    fetch(`${API_URL}/room/${id}`, {
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
      <div className="enterRoomCon">
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
      <div className="chatContainer">
        <div className="topSection">
          <div className="roomUserName">
            <h1>
              Room: <strong>{roomName}</strong>
            </h1>
            <h2>
              Hello <strong>{user.userName}</strong> you can chat safly here :)
            </h2>
            <button onClick={copyLink} className="copyRoom">
              Copy Room Link
            </button>
          </div>
          <TimeLeft room={room} />
        </div>
        <div className="messagesContainer">
          <div className="messages">
            <ul className="messageList" ref={listRef}>
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={
                    msg.username === user.userName
                      ? "message sent"
                      : "message received"
                  }
                >
                  <span className="username">{msg.username}</span>
                  <p className="messageContent">{msg.content}</p>
                  <small className="timestamp">{msg.timestamp}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className="sendMessage">
            <form className="messageForm" onSubmit={sendMessage}>
              <textarea
                className="messageInput"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Type your message..."
                minLength={1}
              ></textarea>
              <button className="sendButton" type="submit">
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="errorPage">
        <h1>This room does not exist or time expired</h1>
      </div>
    );
  }
}

export default Room;
