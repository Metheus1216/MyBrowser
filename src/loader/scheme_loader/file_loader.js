const { EXT_TO_MIME } = require("../../constant/mime");
const fs = require("fs")

function file_loader(path) {
  try {
    const body = fs.readFileSync(path, "utf-8");
    const ext = path.slice(path.lastIndexOf("."));
    const mime = EXT_TO_MIME[ext] || "application/octet-stream";
    console.log("本地file读取成功:", path);
    return { mime, data: body };
  } catch (e) {
    console.log("本地file读取失败:", path, "，错误信息：", e.message);
    return null;
  }
}

module.exports = { file_loader };
