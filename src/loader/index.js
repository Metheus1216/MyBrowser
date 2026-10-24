
const { render } = require("../renderer/index");
const { URLparser } = require("../URLparser/URLparser");
const { file_loader } = require("./scheme_loader/file_loader");
const { data_loader } = require("./scheme_loader/data_loadeer");
const { http_loader } = require("./scheme_loader/http_loader");

function load(url) {
  if (!url) {
    console.log("无 URL 输入");
    url = "file:///./test.html";
  }

  const url_parsed = new URLparser(url);

  // 处理 data: 协议
  if (url_parsed.scheme === "data") {
    render(data_loader(url_parsed.path));
    return;
  }

  // 处理 file: 协议
  if (url_parsed.scheme === "file") {
    render(file_loader(url_parsed.path));
    return;
  }

  // 处理 http / https 协议
  http_loader(url_parsed, render);
  // http这样处理的原因：
  // Node里面网络I/O天生异步，像 net.creareConnection(), client.on() 这样的api，还没等网络读到响应
  // 注册的这些事件函数体就已经走完了，也就是URLparser可能还在发力获取url_parsed呢，数据刚刚传到http_loader
  // 但是http_loader函数体就已经return了
  // 如果继续render(http_loader(...))并且http_loader设计的是return结束函数，因为是异步的，刚开始并没有获取到参数
  // http_loader最后自然return出了一个undifined，可能刚刚return,数据才传过来，但是已经晚了，函数结束了
  // 所以要改写http_loader，摒弃return，设计为能够持续响应数据流的写法
}

module.exports = { load };
