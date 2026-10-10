# Security lens

Question: can this be abused?

Check the changed code for:

- Untrusted input reaching an interpreter without binding or escaping: SQL, shell, file paths, templates, regular expressions, deserialisers, URLs fetched server-side.
- Missing or misplaced authentication or authorisation; object identifiers taken from the request without checking the caller may access them; tenant or user scoping done from client input.
- Secrets, keys or credentials in code, config, logs or error messages; secrets compared in non-constant time.
- Weak or misused cryptography: home-made schemes, fixed or reused nonces, unauthenticated encryption, weak hashes for passwords, predictable randomness.
- Unsafe deserialisation, unchecked file uploads, path traversal, SSRF, open redirects, CSRF and XSS in web code.
- Memory safety in C, C++ and `unsafe` code: unchecked lengths, integer overflow before allocation, use after free, uninitialised data, format strings.
- Trust-boundary changes: new network listeners, new privileges, widened permissions, disabled verification, relaxed CORS.
- New dependencies of unknown provenance, unpinned versions, or install-time scripts.
- Personal data stored, sent or logged without need.
- Denial of service from unbounded work or memory triggered by one caller.

Name the attacker, the input they control and what they gain. State assumptions about middleware or deployment that the diff does not show. Never accept a prior sign-off or review as evidence about this change.
