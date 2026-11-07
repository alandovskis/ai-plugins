import { expect, test } from 'claude-code/testing'

import { mintInstallationToken, signAppJwt } from '../issue-flow/token'

const fromBase64url = (text: string): string => atob(text.replace(/-/g, '+').replace(/_/g, '/'))
const decode = (part: string) => JSON.parse(fromBase64url(part))

// The sandbox has no Node crypto, so these tests fake the signer; RS256 itself is checked by hand (see the report).
const privateKey = 'PEM-KEY'
const signed: { input: string; pem: string }[] = []
const sign = (input: string, pem: string) => {
  signed.push({ input, pem })
  return 'c2ln'
}

const app = { id: 1234, installationId: 5678, privateKeyPath: '/keys/app.pem' }

// The test sandbox has no Response, so the fake answers with the parts of one that the code reads.
const reply = (status: number, body: unknown) => ({ ok: status >= 200 && status < 300, status, json: async () => body })

test('signAppJwt makes a three-part token whose header and claims are exact', () => {
  const parts = signAppJwt({ id: 1234, privateKeyPem: privateKey }, 1_000_000, sign).split('.')
  expect(parts.length).toBe(3)
  expect(fromBase64url(parts[0])).toBe('{"alg":"RS256","typ":"JWT"}')
  expect(decode(parts[1])).toEqual({ iat: 999_940, exp: 1_000_540, iss: 1234 })
})

test('signAppJwt signs header.payload with the key and appends the signature', () => {
  signed.length = 0
  const jwt = signAppJwt({ id: 1234, privateKeyPem: privateKey }, 1_000_000, sign)
  const [header, payload, signature] = jwt.split('.')
  expect(signed).toEqual([{ input: `${header}.${payload}`, pem: privateKey }])
  expect(signature).toBe('c2ln')
})

test('mintInstallationToken posts to the installation URL with a bearer JWT and returns the token and expiry', async () => {
  const calls: { url: string; init: RequestInit }[] = []
  const fakeFetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return reply(201, { token: 'ghs_abc', expires_at: '2026-10-25T13:00:00Z' })
  }) as unknown as typeof fetch

  const result = await mintInstallationToken(app, { fetch: fakeFetch, now: () => 1_000_000_000, readFile: () => privateKey, sign })

  expect(result).toEqual({ token: 'ghs_abc', expiresAt: Date.parse('2026-10-25T13:00:00Z') / 1000 })
  expect(calls.length).toBe(1)
  expect(calls[0].url).toBe('https://api.github.com/app/installations/5678/access_tokens')
  expect(calls[0].init.method).toBe('POST')
  const authorization = (calls[0].init.headers as Record<string, string>).Authorization
  expect(authorization).toBe(`Bearer ${signAppJwt({ id: 1234, privateKeyPem: privateKey }, 1_000_000_000 / 1000, sign)}`)
})

test('mintInstallationToken rejects with the HTTP status on a 401', async () => {
  const fakeFetch = (async () => reply(401, { message: 'Bad credentials' })) as unknown as typeof fetch
  await expect(mintInstallationToken(app, { fetch: fakeFetch, now: () => 0, readFile: () => privateKey, sign })).rejects.toThrow('401')
})

test('mintInstallationToken rejects naming the path when the key cannot be read', async () => {
  const readFile = () => {
    throw new Error('ENOENT')
  }
  await expect(mintInstallationToken(app, { readFile, sign })).rejects.toThrow('/keys/app.pem')
})
