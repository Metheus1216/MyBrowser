function data_loader(path) {
  const parts = path.split(",");
  const mime = parts[0];
  const body = parts.slice(1).join(",");
  console.log("读取 data: URL 成功 (" + mime + ")");
  console.log(body);
  return { mime, data: body };
}

module.exports = { data_loader };
