import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "./socket";

function Room() {
  const [roomName, setRoomName] = useState("");
  const { id } = useParams();
  const [message, setMessage] = useState("");
  //const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  //const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3000/room/${id}`, { mode: "cors" })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setRoomName(res.room_name);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      // setFooEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("foo", onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onFooEvent);
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (isConnected && message) {
      socket.emit("chat-message", message);
      setMessage("");
    }
  };

  if (roomName != "") {
    return (
      <div>
        <h1>Room name: {roomName}</h1>
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
