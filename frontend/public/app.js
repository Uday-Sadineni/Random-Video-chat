const socket = io("https://backend-for-video-chat-0no3.onrender.com");

// from index.html
const onlineNumber = document.getElementById("onlineNumber");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const callBtn = document.getElementById("callBtn");
const send = document.getElementById("send");
const chatbox = document.getElementById("chatbox");
const msginput = document.getElementById("msginput");

socket.on("connect", () => {
  console.log("connected sucess");
});

let localStream;
let peer;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;
  });

function startCall() {
  peer = new SimplePeer({
    initiator: true,
    trickle: false,
    stream: localStream,
    config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },

      {
        urls: "turn:global.relay.metered.ca:80",
        username: "0ef56eba9caa53933b8c24fd",
        credential: "nOV/VnFdXXM9u+4j",
      }
    ]
  }
  });

  peer.on("signal", (data) => {
    console.log("signal sent");
    socket.emit("stream", JSON.stringify(data));
  });

  peer.on("stream", (stream) => {
    console.log("stream sent");
    remoteVideo.srcObject = stream;
  });
}

socket.on("stream", (data) => {
  const signal = JSON.parse(data);
  console.log("stream recieved:", data);
  if (!peer) {
    peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: localStream,
    });
    peer.on("signal", (data) => {
      console.log("signal rec");
      socket.emit("stream", JSON.stringify(data));
    });

    peer.on("stream", (stream) => {
      console.log("stream rec");
      remoteVideo.srcObject = stream;
    });
  }
  peer.signal(signal);
});

socket.on("Message", (data) => {
  const msg = document.createElement("p");
  msg.textContent = "Friend: " + data;
  chatbox.appendChild(msg);
});

callBtn.addEventListener("click", () => {
  startCall();
});

send.addEventListener("click", () => {
  socket.emit("Message", msginput.value);
  const msg = document.createElement("p");
  msg.textContent = "You: " + msginput.value;
  chatbox.appendChild(msg);
  msginput.value = "";
});
