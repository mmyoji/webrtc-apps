const URI = "ws://127.0.0.1:8080/";
const output = document.querySelector("#output");

const ws = new WebSocket(URI);

let pingInterval;

const writeToScreen = (msg) => {
  output.insertAdjacentHTML("afterbegin", `<p>${msg}</p>`);
};

const sendMessage = (msg) => {
  writeToScreen(`SENT: ${msg}`);
  ws.send(msg);
};

ws.onopen = (_e) => {
  writeToScreen("CONNECTED");
  sendMessage("ping");
  pingInterval = setInterval(() => {
    sendMessage("ping");
  }, 5000);
};

ws.onclose = (_e) => {
  writeToScreen("DISCONNECTED");
  clearInterval(pingInterval);
};

ws.onmessage = (e) => {
  writeToScreen(`RECEIVED: ${e.data}`);
};

ws.onerror = (e) => {
  writeToScreen(`ERROR: ${e.data}`);
};
