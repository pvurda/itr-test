import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const portFromEnv = process.env.PORT;
const portFlagIndex = args.indexOf("--port");
const portFromFlag = portFlagIndex >= 0 ? args[portFlagIndex + 1] : undefined;
const portFromArg = args.find((arg) => !arg.startsWith("-"));
const port = portFromFlag || portFromArg || portFromEnv || "8000";
const server = spawn("python3", ["-m", "http.server", port], {
  stdio: "inherit",
});

server.on("exit", (code) => {
  process.exit(code ?? 0);
});
