const socket = new WebSocket("wss://random-video-chat-uj67.onrender.com");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const callBtn = document.getElementById("callBtn");
const send = document.getElementById("send");
const chatbox = document.getElementById("chatbox");
const msginput = document.getElementById("msginput");

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
  });

  peer.on("signal", (data) => {
    socket.send(JSON.stringify(data));
  });

  peer.on("stream", (stream) => {
    remoteVideo.srcObject = stream;
  });
}

socket.onmessage = (event) => {
  const signal = JSON.parse(event.data);
  if (!peer) {
    peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: localStream,
    });
    peer.on("signal", (data) => {
      socket.send(JSON.stringify(data));
    });

    peer.on("stream", (stream) => {
      remoteVideo.srcObject = stream;
    });
  }
  peer.signal(signal);
};

callBtn.onclick = () => startCall();
