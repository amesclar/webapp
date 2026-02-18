# Walkthrough - Security Vulnerability Fix: node-tar (scrum-44)

Addressed a high-severity security vulnerability in `node-tar` by implementing a version override in the frontend project.

## Vulnerability Details
- **Advisory**: Arbitrary File Read/Write via Hardlink Target Escape Through Symlink Chain in node-tar Extraction
- **Package**: `tar`
- **Affected Versions**: < 7.5.8
- **Patched Version**: 7.5.8

## Changes

### Frontend
- **File**: `frontend/package.json`
    - Added `tar`: `7.5.8` to the `overrides` section to ensure all transitive dependencies use the patched version.
- **File**: `frontend/package-lock.json`
    - Updated via `npm install` (executed in Docker) to reflect the new override.

## Verification Results

### Version Check
- **Command**: `grep -A 5 '"node_modules/tar":' frontend/package-lock.json`
- **Result**: Confirms `tar` version is `7.5.8`.
```json
    "node_modules/tar": {
      "version": "7.5.8",
      "resolved": "https://registry.npmjs.org/tar/-/tar-7.5.8.tgz",
```

### Security Audit
- **Command**: `npm audit` (executed in Docker)
- **Result**: `tar` vulnerability no longer appears in the audit report. (8 moderate/low vulnerabilities remain in other packages, which are out of scope for this task).
