// Prints a GitHub App installation token for the repo in the current directory. Usage: node token-cli.js
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validateConfig } from './config.js';
import { mintInstallationToken } from './token.js';
const CONFIG_PATH = '.github/issue-flow.json';
const fail = (message) => {
    process.stderr.write(`${message.replace(/\s*\n\s*/g, ' ')}\n`);
    process.exit(1);
};
try {
    let raw;
    try {
        raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    }
    catch (error) {
        fail(`cannot read ${CONFIG_PATH}: ${error.message}`);
    }
    const result = validateConfig(raw);
    if (!result.ok)
        fail(`invalid ${CONFIG_PATH}: ${result.problems.join('; ')}`);
    else {
        const { token } = await mintInstallationToken(result.config.app, {
            readFile: (path) => readFileSync(path, 'utf8'),
            sign: (input, pem) => createSign('RSA-SHA256').update(input).sign(pem, 'base64url'),
        });
        process.stdout.write(`${token}\n`);
    }
}
catch (error) {
    fail(error.message);
}
