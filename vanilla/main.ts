Deno.serve({
  port: 8080,

  async handler(req) {
    if (req.headers.get("upgrade") !== "websocket") {
      const url = new URL(req.url);

      if (url.pathname === "/public/main.js") {
        const file = await Deno.open("./public/main.js", { read: true });
        return new Response(file.readable);
      } else {
        const file = await Deno.open("./index.html", { read: true });
        return new Response(file.readable);
      }
    }

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      console.log("CONNECTED");
    };

    socket.onmessage = (e) => {
      console.log(`RECEIVED: ${e.data}`);
      socket.send("pong");
    };

    socket.onclose = () => {
      console.log("DISCONNECTED");
    };

    socket.onerror = (err) => {
      console.error(`ERROR:`, err);
    };

    return response;
  },
});
