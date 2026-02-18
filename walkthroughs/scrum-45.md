# Walkthrough - Security Vulnerability Fix: qs (scrum-45)

Addressed a moderate-severity security vulnerability in `qs` by implementing version overrides in both frontend and backend projects.

## Vulnerability Details
- **Advisory**: qs's arrayLimit bypass in comma parsing allows denial of service
- **Package**: `qs`
- **Affected Versions**: >= 6.7.0, <= 6.14.1
- **Patched Version**: 6.14.2

## Changes

### Frontend
- **File**: `frontend/package.json`
    - Added `qs`: `6.14.2` to the `overrides` section.
- **File**: `frontend/package-lock.json`
    - Updated via `npm install` (executed in Docker).

### Backend
- **File**: `backend/package.json`
    - Added `overrides` section with `qs`: `6.14.2`.
- **File**: `backend/package-lock.json`
    - Updated via `npm install` (executed in Docker).

## Verification Results

### Version Check
- **Command**: `grep -A 5 '"node_modules/qs":' frontend/package-lock.json backend/package-lock.json`
- **Result**: Confirms `qs` version is `6.14.2` in both projects.
```json
    "node_modules/qs": {
      "version": "6.14.2",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.14.2.tgz",
```

### Security Audit
- **Command**: `npm audit` (executed in Docker)
- **Result**: 
    - **Frontend**: The `qs` vulnerability no longer appears. (7 moderate vulnerabilities remain in other packages).
    - **Backend**: `found 0 vulnerabilities`.
