import { spawn } from "node:child_process";

const port = process.env.PORT || "8000";
const server = spawn("python3", ["-m", "http.server", port], {
  stdio: "inherit",
});

server.on("exit", (code) => {
  process.exit(code ?? 0);
});
