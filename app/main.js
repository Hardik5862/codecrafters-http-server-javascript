const net = require("net");
const fs = require("fs");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString().split("\r\n");
    const path = req[0].split(" ")[1].trim();
    const method = req[0].split(" ")[0].trim();

    if (path.startsWith("/files/") && method === "GET") {
      const fileName = path.substring(7);
      const dir = process.argv[process.argv.indexOf("--directory") + 1];

      if (!fs.existsSync(dir + fileName)) {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
        return;
      }

      const fileData = fs.readFileSync(dir + fileName);

      return socket.write(
        "HTTP/1.1 200 OK\r\n" +
          "Content-Type: application/octet-stream\r\n" +
          "Content-Length: " +
          fileData.length +
          "\r\n\r\n" +
          fileData +
          "\r\n"
      );
    }

    if (path.startsWith("/files/") && method === "POST") {
      const fileName = path.substring(7);
      const dir = process.argv[process.argv.indexOf("--directory") + 1];

      const fileData = req[req.indexOf("") + 1];

      fs.writeFileSync(dir + fileName, fileData);

      socket.write("HTTP/1.1 201 OK\r\n\r\n");
      socket.end();
      return;
    }

    if (path.startsWith("/user-agent")) {
      const headers = {};
      for (let i = 1; i < req.length; i++) {
        const [k, v] = req[i].split(": ");
        headers[k] = v;
      }

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

    if (path === "/") {
      return socket.write("HTTP/1.1 200 OK\r\n\r\n");
    }

    return socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
