let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const output = document.getElementById("output");

startBtn.onclick = async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob);

    const response = await fetch("/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    output.value = data.transcript || "No transcript available.";
    audioChunks = [];
  };
};

stopBtn.onclick = () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  mediaRecorder.stop();
};
