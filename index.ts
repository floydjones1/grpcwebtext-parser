#!/usr/bin/env node
import { exec } from "child_process";
import { promisify } from "util";
import minimist from "minimist";
import chalk from "chalk";

var argv = minimist(process.argv.slice(2));
const asyncExec = promisify(exec);
const log = console.log;

let grpcWebTexts: Array<string> = [
  "AAAAADEKB2pvZmxveWQSJmh0dHBzOi8vcGljc3VtLnBob3Rvcy9pZC8xMzMvMjc0Mi8xODI4",
  "AAAAAAMInRQ=gAAAACBncnBjLXN0YXR1czowDQpncnBjLW1lc3NhZ2U6T0sNCg==",
];

function getBinaryHex(grpcText: Array<string>) {
  const buffers: Array<string> = [];
  for (const text of grpcText) {
    const buffer = Buffer.from(text, "base64");
    const bufString = buffer.toString("hex");
    buffers.push(bufString);
  }
  return buffers;
}

async function main() {
  const { _: text } = argv;
  if (text.length === 0) {
    console.error("No input grpc text, defaulting to demo values");
  }
  
  // bytes are in base 16
  const buffers = text.length ? getBinaryHex(text) : getBinaryHex(grpcWebTexts);
  for (const i in buffers) {
    const b = buffers[i];
    const webText = grpcWebTexts[i];
    if (b.substr(0, 2) !== "00") return log(chalk.bgRed("Cannot Parse"));

    const frameLen = b.substr(2, 4 * 2);

    // convert to base 10
    const len = parseInt(frameLen, 16);
    const data = b.substr(10, len * 2);

    const { stdout } = await asyncExec(
      `echo ${data} | xxd -r -p | protoc --decode_raw`
    );
    log(`\n${chalk.bgBlue("Web gRPC text:")} ${webText}`);
    console.log(stdout);
  }
}

main();
