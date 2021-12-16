const process = require('process');

describe('parseInputs', function () {
    const OLD_ENV = process.env;

    const MOCK_REQUIRED_INPUTS = {
        'service-name': 'test-test',
        'image': 'mockmock',
        'image-tag': 'latest',
        'private-key': '123ASD',
        'username': 'donkey',
        'hostname': 'kong',
        'port': '443',
        'ghcr-username': 'mario',
        'ghcr-token': 'LOL)91'
    }

    beforeEach(() => {
        jest.resetModules()
        process.env = { ...OLD_ENV }
        setInputs(MOCK_REQUIRED_INPUTS)
    })

    afterAll(() => {
        process.env = OLD_ENV;
    })

    it('should generate docker command', function () {
        const parseInputs = require('./parse-inputs')
        const {deployCommand} = parseInputs()
        expect(deployCommand).toEqual('docker login -u mario -p LOL)91 ghcr.io && docker service update --with-registry-auth  --image mockmock:latest test-test')
    });

    it('should add option without arguments from args', function () {
        setInputs({'args': '--force'})
        const parseInputs = require('./parse-inputs')
        const {deployCommand} = parseInputs()
        expect(deployCommand).toMatch(/.*docker service update.* --force .*test-test/)
    });

    it('should add option with arguments from args', function () {
        setInputs({'args': '--env-add VAR=value,OTHER_VAR=other'})
        const parseInputs = require('./parse-inputs')
        const {deployCommand} = parseInputs()
        expect(deployCommand).toMatch(/.*docker service update.* --env-add VAR=value,OTHER_VAR=other .*test-test/)
    });
});

function setInputs(inputMap) {
    const prefix = 'INPUT_';
    for (let [key, value] of Object.entries(inputMap)) {
        let envKey = `${prefix}${key.toUpperCase().replace(/[\s]/g, '_')}`;
        process.env[envKey] = value;
    }
}
