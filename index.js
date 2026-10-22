const net = require("net");
const tls = require("tls");
const fs = require("fs");

class URLparser {
  constructor(url) {
    // 1. 截取 "://" 第一次在 url 中出现的位置索引
    const schemeEnd = url.indexOf("://");
    if (schemeEnd === -1) {
      // data: 是没有 :// 的
      if (url.startsWith("data:")) {
        this.scheme = "data";
        this.path = url.substring(5);
        return;
      }
      throw new Error("Invalid URL: " + url);
    }

    // 2. 分割字符串，获取协议名
    this.scheme = url.substring(0, schemeEnd);

    // 3. 提取域名及剩下的部分
    let rest = url.substring(schemeEnd + 3);

    // 4. 检查协议是否在可被允许访问范围内
    if (this.scheme === "file") {
      // 去掉开头的 "/"（file:///D:/... 会多出一个 "/"）
      this.path = rest.replace(/^\//, "");
      return;
    }
    URLparser.SchemeChecker(this.scheme, URLparser.ALLOWED_SCHEMES);

    // 5. 检查 "/" 分离 Host 和 Path
    if (!rest.includes("/")) {
      rest += "/";
    }
    const pathStart = rest.indexOf("/");
    this.host = rest.substring(0, pathStart);
    this.path = rest.substring(pathStart);
  }

  // 声明可被允许访问的协议数组
  static ALLOWED_SCHEMES = ["http", "https", "file"];

  static SchemeChecker(currentScheme, allowedSchemes) {
    if (!allowedSchemes.includes(currentScheme)) {
      throw new Error(`This scheme '${currentScheme}' is not allowed.`);
    }
  }
}

function load(url) {
  if (!url) {
    console.log("无 URL 输入");
    url = "file:///./test.html";
  }

  const URL = new URLparser(url);

  // 处理 data: 协议
  if (URL.scheme === "data") {
    const parts = URL.path.split(",");
    const mime = parts[0];
    const body = parts.slice(1).join(",");
    console.log("读取 data: URL 成功 (" + mime + ")");
    console.log(body);
    return;
  }

  // 处理 file: 协议 —— 这里只负责读取本地文件并解析其内容
  if (URL.scheme === "file") {
    try {
      const body = fs.readFileSync(URL.path, "utf-8");
      console.log("读取本地 file 成功: " + URL.path);
      // 本地文件内容当作 HTML 解析显示，而不是再次当作 URL 加载
      displayHTML(body);
    } catch (e) {
      console.error("读取本地 file 失败:", e.message);
    }
    return;
  }

  // 处理 http / https 协议
  const port = URL.scheme === "https" ? 443 : 80;

  const headers = {
    "Host": URL.host,
    "Connection": "close",
    "User-Agent": "netclient/1.0",
  };

  const sendRequest = () => {
    let requestStr = `GET ${URL.path} HTTP/1.1\r\n`;
    for (const [key, value] of Object.entries(headers)) {
      requestStr += `${key}: ${value}\r\n`;
    }
    requestStr += `\r\n`;
    console.log(`正在请求: ${url}`);
    client.write(requestStr);
  };

  const client =
    URL.scheme === "https"
      ? tls.connect({ host: URL.host, port, servername: URL.host }, sendRequest)
      : net.createConnection(port, URL.host, sendRequest);

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
    const body = parts.slice(1).join("\r\n\r\n");

    if (body) {
      displayHTML(body);
    } else {
      console.log("Body is missed.");
    }
  });

  client.on("close", () => {
    console.log("响应结束");
  });
}

function displayHTML(source) {
  let inTag = false;
  let inComment = false;
  let inScript = false;
  let textContent = "";

  // 仅针对 <body>…</body> 之间的内容提取纯文本
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const target = bodyMatch ? bodyMatch[1] : source;

  for (let i = 0; i < target.length; i++) {
    const t = target[i];

    if (inScript) {
      if (target.startsWith("</script", i)) {
        inScript = false;
        inTag = true;
        i += "</script".length - 1;
      }
      continue;
    }

    if (inComment) {
      if (target.startsWith("-->", i)) {
        inComment = false;
        i += 2;
      }
      continue;
    }

    if (t === "<") {
      if (target.startsWith("<!--", i)) {
        inComment = true;
        i += 3;
      } else if (/^<script\b/i.test(target.slice(i, i + 8))) {
        inScript = true;
        inTag = true;
      } else {
        inTag = true;
      }
    } else if (t === ">") {
      inTag = false;
    } else if (!inTag) {
      textContent += t;
    }
  }

  console.log("HTML 的纯文本内容：\n");
  console.log(textContent.trim());
}


const target = process.argv[2] || "file:///./test.html";
load(target);
