const net = require("net")

class URLparser {
  constructor(url) {
    // 1.截取 "://" 第一次在url中出现的位置索引
    // (indexOf()是返回括号内参数第一次出现的索引位置)
    const schemeEnd = url.indexOf("://")
    if (schemeEnd == -1) {
      throw new Error("Invalid URL");
    }

    // 2.分割字符串，获取协议名
    this.scheme = url.substring(0, schemeEnd);

    // 3.提取域名及剩下的部分
    let rest = url.substring(schemeEnd + 3);

    // 4.检查协议是否在可被允许访问范围内
    URLparser.SchemeChecker(this.scheme, URLparser.ALLOWED_SCHEMES);

    // 5.检查 "/" 分离 Host 和 Path
    if (!rest.includes("/")) {
      rest += "/";
    }
    const pathStart = rest.indexOf("/");
    this.host = rest.substring(0, pathStart);
    this.path = rest.substring(pathStart);
  }
  // 声明可被允许访问的协议数组
  static ALLOWED_SCHEMES = ['http', 'https'];

  // allowedSchemes是数组类型
  static SchemeChecker(currentScheme, allowedSchemes) {
    if (!allowedSchemes.includes(currentScheme)) {
      throw new Error(`This scheme '${currentScheme}' is not allowed.`);
    }
  }
}

// 创建请求连接
function load(url) {
  const URL = new URLparser(url);
  let port = 80;

  // 创建套接字socket发起连接
  // 相当于创建一个 net.Socket 对象，返回的正是 net.Socket 实例，代表了客户端与服务端之间的第一条TCP连接
  const client = net.createConnection(port, URL.host, () => {

    console.log("客户端成功发起请求");

    let reqString = `GET ${URL.path} HTTP/1.1\r\n`;
    reqString += `Host: ${URL.host}\r\n`;
    reqString += `Connection: close\r\n`;
    reqString += `\r\n`;

    // 发送数据API
    client.write(reqString);
  })

  // 接收服务端请求
  let resData = "";

  // 监听数据流
  client.on("data", (chunk) => {
    resData += chunk.toString();
  })

  // TCP连接完全关闭
  client.on("close", () => {
    console.log("响应结束\n");
    console.log(resData);
  })

  // TCP连接半关闭状态，此时发送了FIN状态码
  client.on("end", () => {
    console.log("响应接收完毕");
    const parts = resData.split("\r\n\r\n");
    const header = parts[0];
    // slice切去header，join合成字符串
    const body = parts.slice(1).join("\r\n\r\n");

    if (body) {
      HTMLparser(body);
    } else {
      console.log("Body is missed.");
    }
  })
}

function HTMLparser(body) {
  let inTag = false;
  let textContent = "";
  for (let t of body) {
    if (t == "<") {
      inTag = true;
    } else if (t == ">") {
      inTag = false;
    } else if (!inTag) {
      textContent += t;
    }
  }
  console.log("HTML的纯文本内容：\n");
  console.log(textContent.trim());
}

load("http://example.org/index.html");
