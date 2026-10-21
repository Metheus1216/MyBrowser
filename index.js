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

try {
  const parsed = new URLparser("http://example.org/index.html");
  console.log("success")
  console.log("Scheme:", parsed.scheme);
  console.log("Host:", parsed.host);
  console.log("Path:", parsed.path);
} catch (e) {
  console.log("fail", e.message);
}
