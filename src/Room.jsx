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
  const [encriptionKey, setEncryptionKey] = useState(null);

  const API_URL = import.meta.env.VITE_BACKEND_APP_API_URL;

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const keyBase64 = params.get("key");
    console.log(keyBase64, " key");

    if (!keyBase64) {
      alert("Encryption key is missing! You won't be able to read messages.");
      return;
    }
    const decodedKey = decodeURIComponent(keyBase64);

    let keyBytes;
    try {
      keyBytes = new Uint8Array(
        [...atob(decodedKey)].map((char) => char.charCodeAt(0))
      );
    } catch (err) {
      console.error("Base64 decoding error:", err);
      alert("Invalid encryption key.");
      return;
    }

    crypto.subtle
      .importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
        "encrypt",
        "decrypt",
      ])
      .then((importedKey) => {
        console.log(importedKey, " keyy");

        setEncryptionKey(importedKey);
      })
      .catch((err) => console.error("Error importing key:", err));
  }, [id]);

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
    socket.on("chat-message", async (msg, serverOffset) => {
      if (messages.find((ex) => ex.id == msg.id)) return;
      console.log(encriptionKey, " key in socket");

      if (!encriptionKey) {
        console.error("Encryption key missing! Cannot decrypt.");

        return;
      }
      console.log("message", msg);

      const decryptedText = await decryptMessage(
        msg.content,
        msg.iv,
        encriptionKey
      );

      msg.content = decryptedText;
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
  }, [encriptionKey]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (message.trim() === "") return;
    if (!encriptionKey) {
      alert("Encryption key missing! Cannot send message.");
      return;
    }

    const encryptedMsg = await encryptMessage(message, encriptionKey);
    console.log(encryptedMsg);

    const msgData = {
      userId: user.userId,
      text: encryptedMsg.encryptedData,
      iv: encryptedMsg.iv,
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

  async function encryptMessage(message, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return {
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(encrypted))), // Base64
      iv: btoa(String.fromCharCode(...iv)), // Base64 IV (mora se čuvati za dekripciju)
    };
  }
  async function decryptMessage(encryptedData, iv, key) {
    console.log(encryptedData, " data");
    console.log(iv, " iv");

    const encryptedBytes = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );
    const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
  }

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
