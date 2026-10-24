const { load } = require("./src/loader/index");

const url = process.argv[2] || "file:///./test.html";
load(url);
