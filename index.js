const core = require("@actions/core");
const { readFileSync } = require("fs");
const { Client } = require("ssh2");

async function run() {
  try {
    const serviceName = core.getInput("service-name");
    const image = core.getInput("image");
    const imageTag = core.getInput("image-tag");
    const privateKey = core.getInput("private-key");
    const username = core.getInput("username");
    const hostname = core.getInput("hostname");
    const port = core.getInput("port");
    const ghcrUsername = core.getInput("ghcr-username");
    const ghcrToken = core.getInput("ghcr-token");
    const deployCommand = `docker login -u ${ghcrUsername} -p ${ghcrToken} ghcr.io && docker service update --with-registry-auth --image ${image}:${imageTag} ${serviceName}`;

    core.info("Starting to deploy");

    const conn = new Client();
    conn
      .on("ready", () => {
        console.log("Client :: ready");
        conn.exec(deployCommand, (err, stream) => {
          if (err) core.setFailed(err);
          stream
            .on("close", (code, signal) => {
              console.log(
                "Stream :: close :: code: " + code + ", signal: " + signal
              );
              conn.end();
            })
            .on("data", (data) => {
              console.log("STDOUT: " + data);
            })
            .stderr.on("data", (data) => {
              core.setFailed(data);
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
