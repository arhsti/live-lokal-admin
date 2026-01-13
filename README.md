This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Instagram Story Manager

A professional web application for managing Instagram Story content creation and publishing. Built with Next.js App Router, designed for Vercel deployment, and optimized for integration with n8n Cloud workflows.

### 🎯 Purpose

This application provides a complete solution for Instagram Story management without direct Instagram API integration. It focuses on:

- **Admin Interface**: Upload and manage image assets
- **Template System**: Create reusable story templates with custom styling
- **Dynamic Rendering**: Generate 1080x1920 story images with text overlays
- **API Integration**: RESTful endpoints for n8n Cloud automation
- **Object Storage**: S3-compatible storage (Cloudflare R2, AWS S3)

### 🚀 Key Features

- **Professional UI**: Clean, responsive admin dashboard
- **Image Management**: Upload, organize, and manage story assets
- **Template Designer**: Create custom templates with colors and fonts
- **API Endpoints**: RESTful APIs for story rendering and image uploads
- **Server-Side Rendering**: Sharp + SVG for high-quality image generation
- **Production Ready**: Optimized for Vercel with Node.js runtime

### 📁 Project Structure

```
/app
  /login                    # Authentication page
  /admin                    # Admin dashboard
    /images                 # Image library management
    /templates              # Template creation and management
  /api
    /render-story           # POST: Generate story images
    /upload-image           # POST: Upload images to storage

/lib
  auth.ts                   # Authentication utilities
  render.ts                 # Image rendering with Sharp + SVG
  storage.ts                # S3-compatible storage abstraction
```

### 🔧 API Endpoints

#### `POST /api/render-story`
Generate Instagram Story images with dynamic text overlays.

**Request Body:**
```json
{
  "text": "Your story text here",
  "templateId": "optional-template-id"
}
```

**Response:**
```json
{
  "image_url": "https://storage.example.com/stories/123456-abc123.jpg",
  "success": true
}
```

#### `POST /api/upload-image`
Upload images to object storage.

**Form Data:** `image` (file)
**Response:** `{ "image_url": "...", "success": true }`

### ⚙️ Environment Variables

Create a `.env.local` file with:

```env
# Storage Configuration (S3-compatible)
STORAGE_ACCESS_KEY_ID=your_access_key
STORAGE_SECRET_ACCESS_KEY=your_secret_key
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://your-endpoint.com
STORAGE_BUCKET=your-bucket-name
STORAGE_PUBLIC_URL=https://your-public-url.com

# Optional: Authentication (when implemented)
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### 🛠️ Getting Started

1. **Clone and Install:**
   ```bash
   git clone https://github.com/arhsti/live_lokal.git
   cd live_lokal
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your storage credentials
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

4. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

### 🚀 Deployment to Vercel

1. **Connect Repository:** Link your GitHub repo to Vercel
2. **Configure Environment Variables:** Add storage credentials in Vercel dashboard
3. **Deploy:** Vercel will automatically build and deploy

### 🎨 Usage

1. **Access Admin Dashboard:** Visit `/admin` to manage content
2. **Upload Images:** Use the Images section to upload story assets
3. **Create Templates:** Design custom templates in the Templates section
4. **Test Rendering:** Use template preview to test story generation
5. **API Integration:** Connect `/api/render-story` to n8n workflows

### 🔒 Security & Best Practices

- ✅ No hardcoded secrets
- ✅ Server-side only API routes
- ✅ Environment variable configuration
- ✅ Clean separation of concerns
- ✅ Production-ready error handling
- ✅ TypeScript for type safety

### 🤝 Integration with n8n

This app is designed to work seamlessly with n8n Cloud:

1. **Image Upload:** Use `/api/upload-image` to store assets
2. **Story Generation:** Call `/api/render-story` with dynamic content
3. **Webhook Integration:** Receive rendered image URLs for publishing
4. **Template Selection:** Pass `templateId` for consistent branding

### 📝 TODO & Future Enhancements

- [ ] Implement user authentication system
- [ ] Add image editing capabilities
- [ ] Support for multiple text layers
- [ ] Template versioning and history
- [ ] Bulk image operations
- [ ] Analytics and usage tracking
- [ ] Advanced typography options

### 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Image Processing:** Sharp
- **Storage:** AWS SDK v3 (S3-compatible)
- **Deployment:** Vercel
- **Runtime:** Node.js

---

Built for professional Instagram Story management workflows.
