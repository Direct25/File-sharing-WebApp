# File-sharing-WebApp
"Just started to built a small and simple, open-source file-sharing app! 🚀 Upload files, get a shareable link, and let the app handle auto-deletion after 6 days. No registration needed! 🔗 #WebDevelopment #OpenSource #ReactJS #NodeJS #Cloudinary #CloudStorage"

## Setup Instructions

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Direct25/File-sharing-WebApp.git
   cd File-sharing-WebApp/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Cloudinary**
   - Sign up for [Cloudinary](https://cloudinary.com)(Free tier)
   - Go to your Dashboard to find your "Product Environment Credentials
   - Create a `.env` file inside backend folder and fill in your credentials:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     PORT=3001

     ```

4. **Run the backend**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set API URL** (optional, defaults to localhost)
   Create `.env` in frontend folder:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Run the frontend**
   ```bash
   npm start
   ```

### Deployment

#### Backend Deployment

**Option 1: Vercel (Recommended)**
1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. **Important:** Set the root directory to `backend` in Vercel project settings
4. Set environment variables in Vercel dashboard:
   - `B2_APPLICATION_KEY_ID`
   - `B2_APPLICATION_KEY`
   - `B2_BUCKET_NAME`
   - `B2_REGION`
   - `B2_ENDPOINT`
   - `B2_DOWNLOAD_HOST`
5. Deploy

**Troubleshooting Vercel Deployment:**
- Ensure all environment variables are set
- Check Vercel function logs for errors
- Make sure `vercel.json` is in the backend folder
- If deploying as monorepo, set root directory to `backend`

**Option 2: Render**
1. Connect your GitHub repo to [Render](https://render.com)
2. Choose "Web Service"
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables as above
6. Deploy

#### Frontend Deployment

**Vercel:**
1. Connect frontend folder to Vercel
2. Set environment variable: `REACT_APP_API_URL` to your backend URL
3. Deploy

### Features

- ✅ Multiple file upload
- ✅ Progress tracking
- ✅ Dark/Light theme
- ✅ File type validation
- ✅ Direct cloud storage upload
- ✅ Shareable links
- 🚧 File management dashboard (planned)

## Preview

### Intro page
<img alt="Intro" src="frontend/src/assets/images/intro.jpeg" width="65%"></div>

### Home page
<img alt="Home" src="frontend/src/assets/images/home1.jpeg" width="65%"></div>

### progressbar
<img alt="Status" src="frontend/src/assets/images/progressbar.jpeg" width="65%"></div>

### uploaded File
<img alt="Notify" src="frontend/src/assets/images/uploaded.jpeg" width="65%"></div>

### Getlink
<img alt="Getlink" src="frontend/src/assets/images/generatelink.jpeg" width="65%"></div>
=======
## Demo

# File-sharing-WebApp

[🔴 Live Demo](https://file-sharing-web-app-drab.vercel.app/) | [📺 Watch Video](https://res.cloudinary.com/dzf7wfmbb/video/upload/v1769751182/klef2y68im155xoyg2zk.mp4)

"Just started to build a small and simple..."

