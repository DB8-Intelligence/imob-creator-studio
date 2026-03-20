# Workspace Backend Contract

This document defines the expected enforcement behavior for the Railway API / main backend.

## Required request context

The backend must accept and validate `workspace_id` on scoped routes such as:

- `GET /properties?workspace_id=<id>`
- `POST /properties?workspace_id=<id>` or body `workspace_id`
- `GET /templates?workspace_id=<id>`
- `POST /templates?workspace_id=<id>` or body `workspace_id`
- `GET /me?workspace_id=<id>`
- `PATCH /properties/:id?workspace_id=<id>`
- future `creatives`, `brands`, `memberships`

## Required validations

For authenticated requests:

1. resolve the authenticated user
2. load membership in `workspace_memberships`
3. ensure membership is active
4. ensure requested `workspace_id` belongs to that user
5. enforce role checks for mutating endpoints

## Suggested role policy

- `owner`: full access
- `admin`: manage members, templates, properties, brand settings
- `editor`: create/update operational content
- `member`: limited production actions
- `viewer`: read only

## Minimum enforcement by route

### Properties
- read: active membership required
- create/update/delete: `owner|admin|editor`

### Templates
- read: active membership required
- create/update/delete: `owner|admin|editor`

### Memberships / invites
- read: `owner|admin`
- write: `owner|admin`

### Workspace settings
- read: active membership required
- update: `owner|admin`

## Audit recommendation

Store for each mutation:
- user_id
- workspace_id
- role
- action
- timestamp
- target entity/id

## Frontend assumption

The frontend already sends or is prepared to send `workspace_id` in scoped calls. Backend enforcement is the remaining source of truth.
