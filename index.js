const core = require("@actions/core");
const { readFileSync } = require("fs");
const { Client } = require("ssh2");
const parseInputs = require('parse-inputs')

async function run() {
  try {
    const {privateKey, username, hostname, port, deployCommand} = parseInputs();

    core.info("Starting to deploy " + deployCommand );

    const conn = new Client();
    conn
      .on("ready", () => {
        console.log("Client :: ready");
        conn.exec(deployCommand, (err, stream) => {
          if (err) {
            console.log("Got error" + err);
            core.setFailed(err);
          }
          stream
            .on("close", (code, signal) => {
              if(code !== 0){
                core.setFailed("Exit code was not 0");
              }
              console.log(
                "Stream :: close :: code: " + code + ", signal: " + signal
              );
              conn.end();
            })
            .on("data", (data) => {
              console.log("STDOUT: " + data);
            })
            .stderr.on("data", (data) => {
              core.info(data);
            });
        });
      })
      .connect({
        host: hostname,
        port: port,
        username: username,
        privateKey: readFileSync(privateKey),
      });
  } catch (error) {
    core.setFailed(error.message);
  }
}
run();
