import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Room() {
  const [roomName, setRoomName] = useState("");
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://localhost:3000/room/${id}`, { mode: "cors" })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
        setRoomName(res.room_name);
      })
      .catch((error) => console.error(error));
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
