# Product Decisions & Trade-offs

This document tracks the reasoning behind critical product and engineering choices in Millora.

## Why a Marketplace?
Hardware engineers often spend significant time effectively searching for vendors. We focused on liquidity—specifically the speed of receiving quotes—as our primary metric. We found that receiving a quote in under two hours significantly increased conversion rates.

## Communication: Real-Time vs. Email
We chose **Real-Time Contextual Chat** over standard email threads. While emails are simpler to implement, they often lose context. In Millora, we pin chat threads to the specific part being discussed. This requires a more complex WebSocket implementation but reduces clarification loops by approximately 50%.

## Tech Stack: React/Vite vs. Next.js
We selected **React + Vite (SPA)** because Millora functions as a strictly authenticated dashboard. SEO is not a priority for the app itself. This choice allows for a faster development loop and simpler hosting. We may consider migrating to Next.js in the future if we decide to expose public profiles.

## File Storage: Direct Uploads
We implemented **Client-to-Bucket Direct Upload**. We do not proxy file uploads through our backend server because CAD files can be massive (500MB+). Streaming them through a Node server would unnecessarily consume CPU and memory. Instead, the client requests a secure upload URL and uploads directly to storage.
