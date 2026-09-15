# Contributing to Diner

Thanks for considering a contribution.

## Before you start

- Read `README.md` and the documentation under `documentation/`.
- Check existing issues before opening a new one.
- Keep changes focused and avoid mixing unrelated refactors with feature work.

## Development

The current online application lives under `hosted/`.

```bash
cd hosted
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
node tests/operations.test.mjs
pnpm build
```

Use the Node.js and pnpm versions documented in `hosted/package.json`.

## Pull requests

A good pull request should:

1. Explain the user or operational problem being solved.
2. Describe the implementation at a high level.
3. Include tests for behavior changes where practical.
4. Update documentation when behavior, setup, or limitations change.
5. State known limitations or follow-up work explicitly.

## Commit messages

Prefer concise, descriptive commit messages, for example:

- `feat: add purchase batch tracking`
- `fix: correct recipe cost calculation`
- `docs: clarify reporting limitations`

## Scope and status

Diner is under active development. Some long-term product specifications may describe planned behavior that is not yet implemented. The repository documentation should remain explicit about that distinction.
