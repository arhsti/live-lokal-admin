This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

A production-ready Next.js application with App Router designed for Instagram story rendering and management. Features server-side image processing with Sharp and SVG overlays, integrated with n8n Cloud workflows.

### Key Features
- **API Routes**: `/api/render-story` for generating Instagram stories, `/api/upload-image` for image uploads
- **Image Processing**: Server-side rendering using Sharp and SVG for text overlays
- **Storage**: S3-compatible object storage (Cloudflare R2, AWS S3)
- **Authentication**: Placeholder for admin authentication
- **Deployment**: Optimized for Vercel with Node.js runtime

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Storage Configuration (S3-compatible)
STORAGE_ACCESS_KEY_ID=your_access_key
STORAGE_SECRET_ACCESS_KEY=your_secret_key
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://your-endpoint.com
STORAGE_BUCKET=your-bucket-name
STORAGE_PUBLIC_URL=https://your-public-url.com

# Optional: Authentication secrets (when implemented)
# NEXTAUTH_SECRET=your_secret
# NEXTAUTH_URL=http://localhost:3000
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Usage

### Render Story
POST `/api/render-story`

Request body:
```json
{
  "text": "Your story text here",
  "templateId": "optional-template-id"
}
```

Response:
```json
{
  "image_url": "https://storage.example.com/stories/123456-abc123.jpg",
  "success": true
}
```

### Upload Image
POST `/api/upload-image`

Form data with `image` field containing the image file.

## Project Structure

```
/app
  /login          # Login page
  /admin          # Admin dashboard
    /images       # Image management
    /templates    # Template management
  /api
    /render-story # Story rendering API
    /upload-image # Image upload API
/lib
  auth.ts         # Authentication utilities
  render.ts       # Image rendering logic
  storage.ts      # Storage abstraction
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
