# Appwrite Native Roadmap

This document outlines the comprehensive feature set planned for the Appwrite Native application.

## 1. Core & Authentication

- [x] **Session Management**: Login (Email/Password), Sign Up, Logout.
- [x] **Multi-Account Support**: Switch between different Appwrite accounts/endpoints.
- [x] **Project Selection**: List, search, and select projects.
- [x] **Organization Support**: Switch between teams/organizations.

## 2. Dashboard & Monitoring (Native Exclusive)

- [ ] **System Health Pulse** (Self-Hosted Only):
  - **Connection Status**: Real-time Green/Red indicators for internal services (Database, Cache, In-Memory Storage).
  - **Worker Health**: Monitor Queue Depths (Functions, Webhooks, etc.) to detect stuck consumers.
  - **Background Task** (Self-Hosted Only):
    - _Technical Implementation_: Uses `expo-background-fetch` to wake the app periodically.
    - _Detection_: Performs a silent `health.get*` query using the saved Admin Session.
    - _Alerting_: Triggers an `expo-notifications` local push if any health indicator returns non-200.
- [ ] **Project Usage Analytics** (Cloud & Self-Hosted):
  - [x] Interactive touch-charts for Bandwidth, Requests, and Storage execution.
  - Resource Limit tracking (CPU/RAM).(self-hosted only)
- [ ] **Real-time Alerts** (Self-Hosted Only):
  - Local notifications for service health degradation.
  - Alerts for high queue depths or failed jobs chunks.

## 3. Databases

- [x] **Browser**: List Databases and Collections.
- [ ] **Document Management**:
  - CRUD (Create, Read, Update, Delete) Documents.
  - Advanced Filtering & Search (Query builder).
  - JSON Attribute Editor.
- [ ] **Schema Management**:
  - View/Add/Edit Attributes (String, Integer, Boolean, etc.).
  - View/Add/Delete Indexes.
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

- [ ] **Overview**: List all messages and their delivery status.
- [ ] **Provider Management**: View configured providers (APNS, FCM, Mailgun, Twilio, etc.).
- [ ] **Test Bench**:
  - Send test Push Notifications to _current device_ for verification.
  - Trigger test Emails/SMS.
- [ ] **Topics**: Manage messaging topics and subscribers.

## 7. Users & Teams

- [ ] **User Directory**: List, Search, and Filter users.
- [ ] **User Details**:
  - View Sessions, Preferences, and Memberships.
  - Ban/Unban users.
  - View User Activity Logs.
- [ ] **Team Management**: Create teams, invite members, manage roles/permissions.

## 8. Git & Deployments (VCS)

- [ ] **Repo Connectivity**: List connected repositories (GitHub, GitLab, etc.).
- [ ] **Deployment Limits**: View/Manage deployment retention.
- [ ] **Build Logs**: Monitor build progress in real-time.
- [ ] **Manual Deployment**: Trigger deployment from a specific branch/commit.

## 9. Native Utilities

- [ ] **Haptic Feedback**: Tactile responses for critical actions (Deletes, Errors).
- [ ] **Widgets**: Home screen widgets for Project Status or specific Function triggers.
- [ ] **Offline Mode**: Cache read-only data for offline viewing.

## 10. Remote Management (Self-Hosted Power User)

- [ ] **SSH Integration**:
  - _Technical Implementation_: Integrates a native SSH client (e.g., `react-native-ssh-client`).
  - _Security_: Stores Host/Key credentials in the device's Hardware Keychain (Secure Enclave/Keystore).
  - **Targeted Container Restart**: Maps Appwrite Service names to Docker container IDs (e.g., `appwrite-redis`) using SSH to execute surgical `docker restart` commands.
  - **Remote Log Tailing**: Streams raw `docker logs --tail 100 -f` output directly to the app UI via SSH.
- [ ] **Docker Sentinel**:
  - View host-level container status (uptime, resource usage) directly from the host.
  - "Emergency Reboot": Trigger a full system-level restart if the API is completely non-responsive.
