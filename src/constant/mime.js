// 键值对映射表，键是 扩展名 ，值是 MIME 类型。
const EXT_TO_MIME = {
  ".html": "text/html",
  ".htm": "text/html",
  ".txt": "text/plain",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
}

module.exports = { EXT_TO_MIME }
