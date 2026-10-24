function HTML_renderer({ data }) {
  let inTag = false;
  let inComment = false;
  let inScript = false;
  let textContent = "";

  // 仅针对 <body>…</body> 之间的内容提取纯文本
  const bodyMatch = data.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const target = bodyMatch ? bodyMatch[1] : data;

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

module.exports = { HTML_renderer }
