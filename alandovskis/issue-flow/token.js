const jsonPart = (value) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
// A GitHub App JWT: RS256, backdated 60 seconds for clock drift, valid 10 minutes less the backdating.
export const signAppJwt = (app, nowSeconds, sign) => {
    const signingInput = `${jsonPart({ alg: 'RS256', typ: 'JWT' })}.${jsonPart({ iat: nowSeconds - 60, exp: nowSeconds + 540, iss: app.id })}`;
    return `${signingInput}.${sign(signingInput, app.privateKeyPem)}`;
};
export const mintInstallationToken = async (app, deps) => {
    const now = deps.now ?? Date.now;
    let privateKeyPem;
    try {
        privateKeyPem = deps.readFile(app.privateKeyPath);
    }
    catch (error) {
        throw new Error(`cannot read the app private key at ${app.privateKeyPath}: ${error.message}`);
    }
    const jwt = signAppJwt({ id: app.id, privateKeyPem }, Math.floor(now() / 1000), deps.sign);
    const response = await (deps.fetch ?? fetch)(`https://api.github.com/app/installations/${app.installationId}/access_tokens`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
    });
    if (!response.ok)
        throw new Error(`GitHub refused to mint an installation token: HTTP ${response.status}`);
    const body = (await response.json());
    const expiresAt = typeof body.expires_at === 'string' ? Math.floor(Date.parse(body.expires_at) / 1000) : NaN;
    if (typeof body.token !== 'string' || Number.isNaN(expiresAt)) {
        throw new Error('GitHub returned an installation token response without token or expires_at');
    }
    return { token: body.token, expiresAt };
};
