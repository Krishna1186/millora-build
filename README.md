# Millora: Manufacturing at Speed

> **Connect. Quote. Build.**
> An intelligent marketplace connecting hardware innovators with verified manufacturers.

## The Problem
Hardware development is often slowed down by communication friction. Engineers typically send emails to multiple machine shops, wait days for a reply, and manage sensitive files via scattered Dropbox links. This manual process leads to security risks and inconsistent quoting standards.

## The Solution
Millora streamlines the parsing, quoting, and ordering process into a single unified platform.
- **Instant Parsing**: Upload a CAD file to auto-extract dimensions and material specs.
- **Standardized RFQs**: Vendors receive a clean, consistent spec sheet.
- **Context-Aware Chat**: Discuss specific parts directly within the 3D viewer context.

## Key Workflows

### Engineering Dashboard
Manage multiple projects and track status from Draft to Shipped. This central view allows teams to monitor every stage of production without digging through email threads.

### Bidding Engine
Manufacturers receive curated RFQs based on their capabilities. They can submit line-item bids including material setup, run time, and finishing costs.

### Secure Collaboration
All communication is centralized. Discussions are linked to specific parts or orders, eliminating the confusion of lost emails.

---

## System Architecture

We designed Millora for reliability and real-time interactivity.

**Frontend**
Built with React (Vite) and TypeScript for type safety. The UI uses TailwindCSS and Shadcn UI to maintain professional design tokens.

**Backend & Data**
We use a relational PostgreSQL database with real-time subscriptions to handle live updates.

👉 [**View Full Architecture Diagram**](docs/architecture.md)
👉 [**Read Product Decision Log**](docs/product_decisions.md)

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/millora-build.git

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

## Future Roadmap
- **AI Quoting**: Auto-suggest prices based on geometry analysis.
- **Supply Chain Analytics**: Dashboard for teams to track spend.
- **Mobile Support**: App for shop-floor status updates.
