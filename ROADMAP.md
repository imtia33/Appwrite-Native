# Appwrite Native Roadmap

This document outlines the comprehensive feature set planned for the Appwrite Native application.

## 1. Core & Authentication

- [x] **Session Management**: Login (Email/Password), Sign Up, Logout.
- [x] **Multi-Account Support**: Switch between different Appwrite accounts/endpoints.
- [x] **Project Selection**: List, search, and select projects.
- [x] **Organization Support**: Switch between teams/organizations.

## 2. Dashboard & Monitoring (Native Exclusive)

- [ ] **Project Performance Sentinel**:
  - Native touch-charts for high-throughput metrics (Real-time requests/sec).
- [ ] **Project Cloner (🚀 Power Utility)**:
  - _Why Native?_: Orchesrating cross-project migrations is a high-cognitive-load task. This simplifies it to a one-click "Template" workflow.
  - **Full Spec Clone**: Replicate Databases, Buckets, and Users into a new project instance (via `Migrations` service).
  - **Environment Sync**: Quickly clone a Staging project to Production from your phone.

## 3. Databases

- [x] **Browser**: List Databases and Collections.
- [ ] **Document Management**:
  - CRUD (Create, Read, Update, Delete) Documents.
  - Advanced Filtering & Search (Query builder).
  - JSON Attribute Editor.
- [ ] **Schema Utilities**:
  - View/Add/Edit Attributes & Indexes.
- [ ] **Usage Stats**: Collection-specific usage metrics.

## 4. Storage

- [ ] **Bucket Management**: List, Create, Update, Delete buckets.
- [ ] **File Operations**:
  - List files with thumbnail previews.
  - Upload files (Directly from Camera or Device Gallery).
  - Download/Share files using native share sheet.
  - File details & permissions view.
  - Preview rich media (Images, PDF, Video).

## 5. Functions

- [ ] **Management**: List, Create, Update, Delete functions.
- [ ] **Execution Control**:
  - Trigger execution manually (with custom data/payload).
  - "Emergency Switch": Quickly swap active deployment.
- [ ] **Observability**:
  - Real-time Execution Logs streaming.
  - View Execution History & Status (Success/Fail).
  - Usage & Performance metrics (Compute time, Errors).

## 6. Messaging

- [ ] **Migration & Recovery**:
  - Monitor status and **Retry** failed migrations.
- [ ] **Provider Management**: View configured providers (APNS, FCM, Mailgun, etc.).
- [ ] **Topics**: Manage messaging topics and subscribers.

## 7. Users & Teams

- [ ] **User Directory**: List, Search, and Filter users.
- [ ] **User Details**:
  - View Sessions, Preferences, and Memberships.
  - Ban/Unban users.
  - View User Activity Logs.
- [ ] **Team Management**: Create teams, invite members, manage roles/permissions.

## 8. Git & Deployments (VCS)

- [ ] **API Key "Kill Switch"**:
  - Instantly revoke/delete organization-level API keys if a leak is detected (via `deleteKey`).
- [ ] **Build Monitor**: Tracking of function build progress and logs.
- [ ] **Manual Deployment**: Trigger deployment from a specific branch/commit.

## 9. Native Utilities

- [ ] **Haptic Feedback**: Tactile responses for critical actions (Deletes, Errors).
- [ ] **Widgets**: Home screen widgets for Project Status or specific Function triggers.
- [ ] **Offline Mode**: Cache read-only data for offline viewing.

## 10. Remote Management (Self-Hosted Power User)

- [ ] **SSH "Emergency Tunnel" (🚀 Core Native Win)**:
  - _Why Native?_: Browsers are sandboxed. SSH is the only way to fix a server when the API/SSL is down.
  - **Out-of-Band Recovery**: Connect via host IP even if the Appwrite console is 502/Unavailable.
  - **Surgical Restart**: Restart `appwrite-traefik` or `appwrite-worker` via raw Docker commands.
- [ ] **Host Diagnostics Interface**:
  - Cross-reference Appwrite API status with actual Docker container health.
- [ ] **Raw Log Tailing**: Stream `docker logs` at native speeds (bypasses API rate limits).
- [ ] **Background Health Sentinel**:
  - Receive local push notifications if the **Host** becomes unreachable (detected via periodic pulse checks).
