import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

function Room() {
  const [roomName, setRoomName] = useState("");
  const { id } = useParams();
  const [socket, setSocket] = useState(null);

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
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    // listen for events emitted by the server

    socketInstance.on("connect", () => {
      console.log("Connected to server");
    });

    socketInstance.on("message", (data) => {
      console.log(`Received message: ${data}`);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  if (roomName != "") {
    return (
      <div>
        <h1>Room name: {roomName}</h1>
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
