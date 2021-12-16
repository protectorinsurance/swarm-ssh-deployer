const core = require("@actions/core");

function parseInputs() {
    const serviceName = core.getInput("service-name");
    const image = core.getInput("image");
    const imageTag = core.getInput("image-tag");
    const privateKey = core.getInput("private-key");
    const username = core.getInput("username");
    const hostname = core.getInput("hostname");
    const port = core.getInput("port");
    const ghcrUsername = core.getInput("ghcr-username");
    const ghcrToken = core.getInput("ghcr-token");
    const loginCommand = `docker login -u ${ghcrUsername} -p ${ghcrToken} ghcr.io`;
    const args = core.getInput("args")
    const serviceCommand = `docker service update --with-registry-auth ${args} --image ${image}:${imageTag} ${serviceName}`;
    const deployCommand = `${loginCommand} && ${serviceCommand}`;

    return {privateKey, username, hostname, port, deployCommand};
}

module.exports = parseInputs;
