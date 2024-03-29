const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString().split("\r\n");
    const path = req[0].split(" ")[1].trim();

    const headers = {};
    for (let i = 1; i < req.length; i++) {
      const [k, v] = req[i].split(": ");
      headers[k] = v;
    }

    if (path.startsWith("/user-agent")) {
      const userAgent = headers["User-Agent"];
      return socket.write(
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: text/plain\r\n" +
          "Content-Length: " +
          userAgent.length +
          "\r\n\r\n" +
          userAgent +
          "\r\n"
      );
    }

    if (path.startsWith("/echo/")) {
      const val = path.substring(6);

      return socket.write(
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: text/plain\r\n" +
          "Content-Length: " +
          val.length +
          "\r\n\r\n" +
          val +
          "\r\n"
      );
    }

    if (path === "" || path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
