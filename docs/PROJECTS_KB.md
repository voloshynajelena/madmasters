# Projects Knowledge Base

The Projects Knowledge Base is an admin feature that centralizes all critical project information for the web studio team. It stores project essence, tech stack details, setup/deploy instructions, environment URLs, and links to all related services.

## Table of Contents

- [Overview](#overview)
- [Accessing the Admin Portal](#accessing-the-admin-portal)
- [Field Definitions](#field-definitions)
- [Using the Admin Page](#using-the-admin-page)
- [Excel Export](#excel-export)
- [Importing Projects](#importing-projects)
- [Seeding Projects](#seeding-projects)
- [API Reference](#api-reference)
- [Security Considerations](#security-considerations)

---

## Overview

The Projects Knowledge Base allows the team to:

- **Track all projects** with their status, team, and ownership
- **Document tech stacks** including frontend, backend, database, and services
- **Store runbooks and instructions** in Markdown format for local setup, deployment, testing, and incident response
- **Manage environment URLs** (DEV, STAGE, PROD, etc.)
- **Centralize service links** (repos, trackers, design tools, hosting consoles, monitoring, etc.)
- **Track operations and security** details including PII levels, data regions, and compliance notes
- **Export to Excel** for backup, offline access, and sharing

---

## Accessing the Admin Portal

1. Navigate to `/admin/projects` in the admin portal
2. You must be logged in with an admin or editor role
3. The sidebar includes a "Projects KB" link

---

## Field Definitions

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Unique identifier (lowercase, alphanumeric, hyphens only) |
| `name` | string | Yes | Display name of the project |
| `client` | string | No | Client name or "Internal Product" |
| `status` | enum | Yes | `active`, `maintenance`, `paused`, `archived`, `completed` |
| `type` | enum | No | `internal` (our products) or `client` (client projects). Default: `client` |
| `oneLiner` | string | Yes | Brief one-line description |
| `essence` | string | Yes | Detailed description of what the project is about |
| `productUrls` | string[] | No | Public URLs of the product |
| `owner` | string | No | Product owner name |
| `techLead` | string | No | Technical lead name |
| `team` | string[] | No | List of team member names |
| `tags` | string[] | No | Tags for categorization and filtering |

### Stack Fields

Each stack component has `name`, `version` (optional), and `notes` (optional):

| Component | Description |
|-----------|-------------|
| `frontend` | Frontend framework/library (e.g., Next.js, React) |
| `backend` | Backend framework (e.g., Node.js, Python, Go) |
| `database` | Database system (e.g., PostgreSQL, MongoDB, Firebase) |
| `hosting` | Hosting provider (e.g., Vercel, AWS, GCP) |
| `auth` | Authentication provider (e.g., Firebase Auth, Auth0) |
| `cicd` | CI/CD system (e.g., GitHub Actions, CircleCI) |
| `analytics` | Analytics tool (e.g., Google Analytics, Mixpanel) |
| `monitoring` | Monitoring tool (e.g., Sentry, Datadog) |

### Environments

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | `DEV`, `STAGE`, `PROD`, `DEMO`, `QA` |
| `url` | string | URL of the environment |
| `notes` | string | Additional notes (e.g., "Requires VPN") |
| `healthCheckUrl` | string | Optional health check endpoint |

### Links Registry

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | See Link Types below |
| `label` | string | Display label |
| `url` | string | URL |
| `notes` | string | Additional notes |

**Link Types:**
- `REPO` - Source code repository
- `JIRA` - Jira project/board
- `FIGMA` - Figma design files
- `SENTRY` - Sentry error tracking
- `VERCEL` - Vercel dashboard
- `AWS` - AWS console
- `GCP` - Google Cloud console
- `FIREBASE` - Firebase console
- `SUPABASE` - Supabase dashboard
- `AUTH` - Authentication provider console
- `DATABASE` - Database admin console
- `STORAGE` - File storage console
- `ANALYTICS` - Analytics dashboard
- `MONITORING` - Monitoring dashboard
- `DOCS` - Documentation
- `WEBSITE` - Public website
- `SLACK` - Slack channel
- `NOTION` - Notion page
- `CONFLUENCE` - Confluence docs
- `OTHER` - Other link type

### Instructions (Markdown)

| Field | Description |
|-------|-------------|
| `localSetupMd` | How to set up the project locally |
| `deployMd` | Deployment procedures for each environment |
| `testingMd` | Testing strategy and how to run tests |
| `runbookMd` | Operational runbook for incidents |
| `knownIssuesMd` | Known issues and workarounds |

### Operations

| Field | Type | Description |
|-------|------|-------------|
| `sla` | string | SLA commitment (e.g., "99.9% uptime") |
| `backups` | string | Backup strategy |
| `pii` | enum | PII level: `none`, `low`, `medium`, `high`, `unknown` |
| `dataRegion` | string | Data residency region (e.g., "US-East", "EU-West") |
| `secretsLocation` | string | Reference to where secrets are stored (e.g., "1Password vault: ProjectName") |
| `onCallRotation` | string | On-call schedule reference |
| `incidentProcess` | string | Incident response process |

### Security

| Field | Type | Description |
|-------|------|-------------|
| `authMethod` | string | Authentication method (e.g., "OAuth 2.0", "JWT") |
| `dataEncryption` | string | Encryption details (e.g., "AES-256 at rest, TLS in transit") |
| `complianceNotes` | string | Compliance requirements (e.g., "GDPR", "HIPAA") |

---

## Using the Admin Page

### Projects List (`/admin/projects`)

- **Search**: Type in the search box to filter by name, key, client, or description
- **Status Filter**: Click status buttons to filter by project status
- **Tags**: View tags on each project row
- **Actions**:
  - **View**: Open project details
  - **Export**: Export single project to Excel
  - **Delete**: Delete project (requires confirmation)
- **Export All**: Export all projects (or filtered list) to Excel

### Project Details (`/admin/projects/[id]`)

Navigate through tabs to view different aspects:

1. **Overview** - Basic info, essence, URLs, team
2. **Stack** - Tech stack details
3. **Environments** - Environment URLs and notes
4. **Links** - All service links
5. **Instructions** - Markdown runbooks
6. **Operations** - SLA, backups, PII, secrets location
7. **Security** - Auth, encryption, compliance
8. **Activity** - Change log and audit trail

Click **Edit Project** to modify any field.

### Creating a Project (`/admin/projects/new`)

1. Click **+ New Project** on the projects list
2. Fill in required fields (key, name, oneLiner, essence)
3. Navigate through tabs to complete all sections
4. Click **Create Project**

### Editing a Project

1. Open project details
2. Click **Edit Project**
3. Modify fields across tabs
4. Click **Save Changes**

---

## Excel Export

### Export Options

- **Export All**: Download all projects
- **Export Filtered**: Download projects matching current filter
- **Export Single**: Download one project

### Sheet Structure

The exported `.xlsx` file contains 4 sheets:

#### Sheet 1: Projects

One row per project with columns:
- Key, Name, Client, Status, One-liner, Essence
- Product URLs (comma-separated)
- Owner, Tech Lead, Team (comma-separated), Tags
- Frontend, Backend, Database, Hosting, Auth
- PII Level, Data Region, Secrets Location, SLA
- Updated At, Updated By

#### Sheet 2: Links

One row per link with columns:
- Project Key, Project Name
- Link Type, Label, URL, Notes

#### Sheet 3: Environments

One row per environment with columns:
- Project Key, Project Name
- Environment Type, URL, Notes

#### Sheet 4: Instructions

One row per project with columns:
- Project Key, Project Name
- Local Setup (markdown)
- Deploy (markdown)
- Testing (markdown)
- Runbook (markdown)
- Known Issues (markdown)

### File Naming

- All projects: `projects-knowledge-base-YYYY-MM-DD.xlsx`
- Single project: `project-{key}-YYYY-MM-DD.xlsx`

---

## Importing Projects

### Import via Admin UI

1. Navigate to `/admin/projects`
2. Click the **Import** button
3. Select a `.json` or `.xlsx` file
4. Choose import mode:
   - **Skip**: Keep existing projects, skip duplicates
   - **Merge**: Update existing with new data, keep unspecified fields
   - **Overwrite**: Replace existing projects entirely
5. Click **Import**

### Supported File Formats

#### JSON Format

```json
{
  "projects": [
    {
      "key": "my-project",
      "name": "My Project",
      "client": "Client Name",
      "status": "active",
      "type": "client",
      "oneLiner": "Brief description",
      "essence": "Detailed description",
      "productUrls": ["https://example.com"],
      "owner": "John Doe",
      "techLead": "Jane Smith",
      "team": ["Alice", "Bob"],
      "tags": ["web", "saas"],
      "stack": {
        "frontend": { "name": "Next.js", "version": "14.0" },
        "backend": { "name": "Node.js", "version": "20" },
        "database": { "name": "PostgreSQL", "version": "15" },
        "hosting": { "name": "Vercel" },
        "auth": { "name": "Firebase Auth" }
      },
      "environments": [
        { "type": "PROD", "url": "https://example.com", "notes": "" }
      ],
      "links": [
        { "type": "REPO", "label": "GitHub", "url": "https://github.com/org/repo" }
      ],
      "instructions": {
        "localSetupMd": "## Local Setup\n\n...",
        "deployMd": "## Deploy\n\n...",
        "testingMd": "## Testing\n\n...",
        "runbookMd": "## Runbook\n\n...",
        "knownIssuesMd": "## Known Issues\n\n..."
      },
      "operations": {
        "pii": "low",
        "secretsLocation": "1Password vault: MyProject"
      }
    }
  ]
}
```

You can also use a direct array without the `projects` wrapper.

#### Excel Format

Import from an Excel file exported from the system, or create your own with these sheets:

**Sheet 1: Projects**
| Column | Description |
|--------|-------------|
| Key | Project key (required) |
| Name | Project name (required) |
| Client | Client name |
| Status | active/maintenance/paused/archived/completed |
| Type | internal/client (default: client) |
| One-liner | Brief description (required) |
| Essence | Detailed description (required) |
| Product URLs | Comma-separated URLs |
| Owner | Owner name |
| Tech Lead | Tech lead name |
| Team | Comma-separated names |
| Tags | Comma-separated tags |
| Frontend | Frontend framework |
| Backend | Backend framework |
| Database | Database system |
| Hosting | Hosting provider |
| Auth | Auth provider |
| PII Level | none/low/medium/high/unknown |
| Data Region | Region code |
| Secrets Location | Reference to secrets vault |

**Sheet 2: Links** (optional)
| Column | Description |
|--------|-------------|
| Project Key | Key of the project |
| Project Name | Name (ignored, for readability) |
| Type | REPO/JIRA/FIGMA/etc. |
| Label | Display label |
| URL | Link URL |
| Notes | Additional notes |

**Sheet 3: Environments** (optional)
| Column | Description |
|--------|-------------|
| Project Key | Key of the project |
| Project Name | Name (ignored, for readability) |
| Type | DEV/STAGE/PROD/DEMO/QA |
| URL | Environment URL |
| Notes | Additional notes |

**Sheet 4: Instructions** (optional)
| Column | Description |
|--------|-------------|
| Project Key | Key of the project |
| Project Name | Name (ignored, for readability) |
| Local Setup | Markdown content |
| Deploy | Markdown content |
| Testing | Markdown content |
| Runbook | Markdown content |
| Known Issues | Markdown content |

### Import API

```
POST /api/admin/projects/import
Content-Type: multipart/form-data

file: <file>
mode: skip | update | overwrite
```

**Response:**
```json
{
  "success": true,
  "created": 2,
  "updated": 1,
  "skipped": 0,
  "errors": [],
  "projects": [
    { "key": "project-1", "id": "abc123", "action": "created" },
    { "key": "project-2", "id": "def456", "action": "updated" }
  ]
}
```

---

## Seeding Projects

### Seed File Location

`/src/data/projects.seed.json`

### Running the Seed Script

```bash
# Dry run (shows what would be done)
npx tsx scripts/seed-projects.ts --dry-run

# Seed new projects only (skip existing)
npx tsx scripts/seed-projects.ts

# Force override existing projects
npx tsx scripts/seed-projects.ts --force
```

### Required Environment Variables

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

### Seed JSON Format

```json
{
  "projects": [
    {
      "key": "my-project",
      "name": "My Project",
      "client": "Client Name",
      "status": "active",
      "type": "client",
      "oneLiner": "Brief description",
      "essence": "Detailed description",
      "productUrls": ["https://example.com"],
      "owner": "John Doe",
      "techLead": "Jane Smith",
      "team": ["Alice", "Bob"],
      "tags": ["web", "saas"],
      "stack": {
        "frontend": { "name": "Next.js", "version": "14.0", "notes": "" },
        "backend": { "name": "Node.js", "version": "20", "notes": "" },
        "database": { "name": "PostgreSQL", "version": "15", "notes": "" },
        "hosting": { "name": "Vercel", "notes": "" },
        "auth": { "name": "Firebase Auth", "notes": "" }
      },
      "environments": [
        { "type": "PROD", "url": "https://example.com", "notes": "" }
      ],
      "links": [
        { "type": "REPO", "label": "GitHub", "url": "https://github.com/org/repo", "notes": "" }
      ],
      "instructions": {
        "localSetupMd": "## Local Setup\n\n...",
        "deployMd": "## Deploy\n\n...",
        "testingMd": "## Testing\n\n...",
        "runbookMd": "## Runbook\n\n...",
        "knownIssuesMd": "## Known Issues\n\n..."
      },
      "operations": {
        "sla": "99.9%",
        "backups": "Daily",
        "pii": "low",
        "dataRegion": "US-East",
        "secretsLocation": "1Password vault: MyProject"
      },
      "security": {
        "authMethod": "OAuth 2.0",
        "dataEncryption": "AES-256",
        "complianceNotes": "GDPR compliant"
      }
    }
  ]
}
```

---

## API Reference

### List Projects

```
GET /api/admin/projects
GET /api/admin/projects?status=active
GET /api/admin/projects?search=keyword
GET /api/admin/projects?tag=web
GET /api/admin/projects?owner=John
```

### Get Single Project

```
GET /api/admin/projects/[id]
```

### Create Project

```
POST /api/admin/projects
Content-Type: application/json

{ ...project data }
```

### Update Project

```
PUT /api/admin/projects/[id]
Content-Type: application/json

{ ...fields to update }
```

### Delete Project

```
DELETE /api/admin/projects/[id]
```

### Export Projects

```
GET /api/admin/projects/export              # All projects
GET /api/admin/projects/export?status=active # Filtered
GET /api/admin/projects/export?id=[id]       # Single project
```

Returns `.xlsx` file as download.

---

## Security Considerations

### Never Store Secrets

The Projects Knowledge Base is designed to store **references** to secrets, not actual secrets:

- Use `secretsLocation` to reference where credentials are stored (e.g., "1Password vault: ProjectName")
- Never store API keys, passwords, or tokens in any field
- The database is not encrypted at the application level

### Access Control

- All endpoints require authentication via session cookie
- Only admin and editor roles can access the projects API
- Activity log tracks who made changes

### Data Protection

- PII level field helps identify projects with sensitive data
- Data region field documents where data is stored
- Compliance notes field documents regulatory requirements

---

## Troubleshooting

### "A project with this key already exists"

Project keys must be unique. Choose a different key or delete the existing project.

### Export fails

- Check browser console for errors
- Ensure you're logged in
- Try exporting a single project first

### Seed script fails

- Verify Firebase environment variables are set
- Check that the seed JSON is valid
- Use `--dry-run` to debug without making changes

---

## Support

For issues or feature requests, contact the development team or create an issue in the repository.
