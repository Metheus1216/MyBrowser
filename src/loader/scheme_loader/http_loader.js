const tls = require("tls");
const net = require("net");

// 异步函数
function http_loader(url_parsed, callbackFn) {
  const port = url_parsed.scheme === "https" ? 443 : 80;

  const headers = {
    "Host": url_parsed.host,
    "Connection": "close",
    "User-Agent": "netclient/1.0",
  };

  const sendRequest = () => {
    let requestStr = `GET ${url_parsed.path} HTTP/1.1\r\n`;
    for (const [key, value] of Object.entries(headers)) {
      requestStr += `${key}: ${value}\r\n`;
    }
    requestStr += `\r\n`;
    console.log(`正在请求中`);
    client.write(requestStr);
  };

  const client =
    url_parsed.scheme === "https"
      ? tls.connect({ host: url_parsed.host, port, servername: url_parsed.host }, sendRequest)
      : net.createConnection(port, url_parsed.host, sendRequest);

  let resData = "";

  client.on("data", (chunk) => {
    resData += chunk.toString();
  });

  client.on("connect", () => {});

  client.on("error", (err) => {
    console.error("连接失败:", err.message);
  });

  client.on("end", () => {
    console.log("响应接收完毕");
    const parts = resData.split("\r\n\r\n");
    const headerText = parts[0];
    const body = parts.slice(1).join("\r\n\r\n");
    const mime = /^content-type:\s*([^;\r\n]+)/im.exec(headerText)?.[1]?.trim() || "text/html";
    if (body) {
      callbackFn({ mime, data: body });
    } else {
      console.log("Body is missed.");
    }
  });

  client.on("close", () => {
    console.log("响应结束");
  });
}

module.exports = { http_loader };
