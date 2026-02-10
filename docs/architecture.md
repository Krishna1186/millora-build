# System Architecture

## High-Level Overview

Millora connects hardware engineers (Buyers) with manufacturing shops (Sellers). The system is designed to handle complex file parsing, real-time negotiation, and order tracking.

```mermaid
graph TB
    User[User (Engineer/Manufacturer)]
    CDN[CDN (Cloudflare)]
    Web[Web Client (React/Vite)]
    API[API Gateway]
    Auth[Auth Service (Supabase Auth)]
    DB[(PostgreSQL Database)]
    Storage[File Storage (Blueprints/CAD)]

    User -->|HTTPS| CDN
    CDN --> Web
    Web -->|REST/Socket| API
    Web -->|Auth Tokens| Auth
    API -->|Read/Write| DB
    API -->|Upload/Download| Storage
```

## Core Components

### Frontend Client
The client is built with React, TypeScript, and TailwindCSS. It handles UI, form validation, and real-time socket connections for chat. We use **React Query** for server state syncing to ensure users always see live bid data.

### Backend / API Layer
Running on Node.js (Edge Functions) / Supabase.
- **Parsing Service**: Extracts metadata from uploaded CAD files.
- **Matching Engine**: Routes RFQs (Requests for Quote) to relevant manufacturers based on tags (e.g., "CNC", "3D Printing").

### Database Design
We use a relational model to ensure data integrity between Orders and Payments.
- **Users**: Profiles and Role management.
- **Projects**: Containers for multiple parts.
- **Parts**: Individual components with separate CAD files and specs.
- **Bids**: Many-to-One relationship with Projects.
- **Messages**: Linked to specific Bids for context-aware chat.

## Security & Privacy
**Row Level Security (RLS)**
Database policies ensure Manufacturers can only see projects they are invited to bid on.

**Presigned URLs**
CAD files are served via time-limited URLs to prevent unauthorized scraping.
