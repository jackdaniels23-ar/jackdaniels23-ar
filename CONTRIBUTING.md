# Contributing

Shadow Terminal is a generated GitHub profile and personal branding project.

## Development

Work from the generator directory:

```powershell
cd generator
npm install
npm run build
npm test
```

Edit profile content in:

```text
generator/config/profile.json
```

Then rebuild generated assets:

```powershell
npm run build
```

## Guidelines

- Keep profile content accurate and based on real projects, CTF progress, and achievements.
- Avoid fake skill percentages or inflated stats.
- Keep interactive features such as chat, music, and live terminal behavior for the future portfolio website.
- Update `CHANGELOG.md` when making release-level changes.

## Release Flow

1. Update `generator/config/profile.json` release metadata.
2. Run `npm run build` and `npm test` from `generator/`.
3. Commit the generated changes.
4. Create a GitHub Release for stable milestones such as `v1.0.0`, `v1.1.0`, and `v2.0.0`.
