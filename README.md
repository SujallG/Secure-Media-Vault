Secure Media Vault 🔒
A production-ready private media library featuring secure 2-step uploads, row-level access control, and expiring download links. Built with enterprise-grade security practices and a beautiful glass-morphism UI.

🚀 Features
Security & Architecture
🔐 Secure 2-Step Upload Flow - One-time upload tickets with integrity verification

🛡️ Row-Level Security - Users only see their own files and shared content

⏱️ Expiring Links - Download URLs automatically expire after 90 seconds

🔒 File Integrity - SHA-256 hash verification prevents corruption

📊 Audit Logging - Track all download activities

User Experience
🎨 Glass Morphism UI - Beautiful iOS 17-inspired design

📁 Drag & Drop Upload - Intuitive file management with progress tracking

🔄 Resilient Uploads - Cancel, retry, and error recovery

⏰ Live Countdown - Visual timer for download link expiration

👥 File Sharing - Secure sharing with other users

🛠 Tech Stack
Frontend: React 18 + TypeScript + Vite

Backend: GraphQL Yoga + Node.js + TypeScript

Database: Supabase (PostgreSQL) + Row Level Security

Storage: Supabase Storage (Private Buckets)

Auth: Supabase Authentication

Edge: Supabase Edge Functions

📋 Prerequisites
Node.js 18+

npm or pnpm

Supabase account

⚡ Quick Start

1. Clone & Setup
   bash
   git clone <your-repo-url>
   cd secure-media-vault
   npm install
2. Supabase Setup
   Create Project
   Go to Supabase and create new project

Wait for database to initialize

Database Setup
Run this SQL in SQL Editor:

sql
-- Copy entire SQL from: supabase/migrations/001_initial_schema.sql
Environment Variables
Create apps/api/.env:

env
SUPABASE_URL=https://xxrjhlamprwwmwlkxlds.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cmpobGFtcHJ3d213bGt4bGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDIxMDUsImV4cCI6MjA3NzQxODEwNX0.klg7hmAVjmVo8H3Kms6F2nUpQnJiQZpX2ofo69h6LrY
API_PORT=4000
Create apps/web/.env:

env
VITE_SUPABASE_URL=https://xxrjhlamprwwmwlkxlds.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cmpobGFtcHJ3d213bGt4bGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDIxMDUsImV4cCI6MjA3NzQxODEwNX0.klg7hmAVjmVo8H3Kms6F2nUpQnJiQZpX2ofo69h6LrY
Storage Bucket
Go to Storage → Create Bucket

Name: private-assets

Set to Private

Edge Function
Go to Edge Functions → Create New Function

Name: hash-object

Paste code from edge-functions/hash-object/index.ts

Set environment variables:

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

3. Run Application
   bash

# Start both frontend and backend

npm run dev

# Or start individually

npm run dev:web # http://localhost:3000
npm run dev:api # http://localhost:4000
🏗 Architecture
Secure Upload Flow
text

1. Request Upload Ticket → 2. Upload to Signed URL → 3. Verify Integrity → 4. Finalize
   Security Model
   Authentication: JWT tokens via Supabase Auth

Authorization: Row-Level Security policies

File Validation: MIME type allowlist + magic bytes verification

Path Safety: Filename sanitization against traversal attacks

Replay Protection: Single-use upload tickets with nonce

🧪 Testing
Run Test Suite
bash
npm test
Acceptance Tests
The implementation passes all 8 required acceptance checks:

✅ Replay Protection - Double finalizeUpload is idempotent

✅ Hash Mismatch - Wrong SHA-256 marks file as corrupt

✅ RLS Enforcement - User isolation prevents cross-access

✅ TTL Compliance - Download links expire after 90s

✅ Version Conflict - Concurrent edits handled gracefully

✅ Upload Resilience - Cancel/retry with same assetId

✅ MIME Validation - File type spoofing prevented

✅ Path Safety - Malicious filenames normalized

Manual Testing Scripts
bash

# Test version conflicts

curl -X POST http://localhost:4000/graphql \
 -H "Authorization: Bearer <token>" \
 -H "Content-Type: application/json" \
 -d '{"query":"mutation { renameAsset(assetId:\"id\", filename:\"test\", version:1) { id } }"}'

# Test hash integrity

# Upload file then call finalizeUpload with incorrect SHA-256

🔒 Security Implementation
Threat Mitigation
Threat Solution
Replay Attacks Single-use tickets with expiration
Path Traversal Filename sanitization & normalization
MIME Spoofing Server-side magic bytes verification
Unauthorized Access Row-Level Security policies
Link Leakage Short-lived signed URLs (90s TTL)
Security Headers
CORS properly configured for cross-origin requests

JWT token validation on all GraphQL operations

Private storage bucket with user-scoped access

📊 API Documentation
GraphQL Schema
graphql

# Upload file (2-step process)

mutation CreateUploadUrl($filename: String!, $mime: String!, $size: Int!) {
createUploadUrl(filename: $filename, mime: $mime, size: $size) {
assetId, uploadUrl, expiresAt, nonce
}
}

# Finalize upload with integrity check

mutation FinalizeUpload($assetId: ID!, $clientSha256: String!, $version: Int!) {
finalizeUpload(assetId: $assetId, clientSha256: $clientSha256, version: $version) {
id, status, sha256, version
}
}

# Get temporary download link

query GetDownloadUrl($assetId: ID!) {
getDownloadUrl(assetId: $assetId) {
url, expiresAt
}
}
🎨 UI/UX Features
Glass Morphism Design
Backdrop Filters: Real glass blur effects

Smooth Animations: CSS transitions with cubic-bezier timing

Floating Cards: Elevated design with subtle shadows

Micro-interactions: Hover effects and state transitions

State Management
typescript
interface UploadState {
status: 'idle' | 'requesting-ticket' | 'uploading' | 'verifying' | 'ready' | 'error';
progress: number;
assetId?: string;
error?: string;
controller?: AbortController;
}
⚙️ Configuration
Environment Variables
Variable Purpose Location
SUPABASE_URL Database connection API, Edge Function
SUPABASE_SERVICE_ROLE_KEY Admin operations API, Edge Function
VITE_SUPABASE_ANON_KEY Client-side auth Web app
File Upload Limits
Max File Size: 50MB

Allowed Types: JPEG, PNG, WebP, PDF

Upload Timeout: 15 minutes

🚀 Deployment
Production Build
bash
npm run build
Environment Setup
Set production environment variables

Deploy Edge Function to Supabase

Configure custom domain (optional)

Set up SSL certificates

📈 Performance
Optimizations
Lazy Loading: Components load on demand

Efficient Queries: GraphQL field selection

Caching: Client-side cache for assets

Background Processing: Hash computation off main thread

Monitoring
Upload progress tracking

Error rate monitoring

Performance metrics collection

🤝 Contributing
Fork the repository

Create feature branch (git checkout -b feature/amazing-feature)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing-feature)

Open Pull Request

📝 License
This project is licensed under the MIT License - see LICENSE file for details.

🎯 Roadmap
Advanced file previews

Bulk operations

Advanced sharing permissions

Mobile app

Advanced analytics

🔗 Links
Live Demo:https://drive.google.com/file/d/15m5VIaIavxveYRtti5N9NqSMJ6ldybDB/view?usp=sharing

API Documentation: GraphQL Playground

Issue Tracker: [GitHub Issues]

👥 Team
Built with ❤️ by [Sujal Garg] as a demonstration of full-stack development expertise.
