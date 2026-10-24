class URLparser {
  constructor(url) {
    // 1. 截取 "://" 第一次在 url 中出现的位置索引
    const schemeEnd = url.indexOf("://");
    if (schemeEnd === -1) {
      // data: 协议是没有 :// 的
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

module.exports = { URLparser };
