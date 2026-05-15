<div align="center">

<!-- Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=LearnBot%20AI&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Your%20Intelligent%20Study%20Companion&descAlignY=55&descSize=20" width="100%"/>

<!-- Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Groq-LLaMA-FF6B6B?style=for-the-badge&logo=ai&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
  <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge"/>
</p>

<br/>

> 🤖 **LearnBot AI** is a full-stack AI-powered study assistant that helps students learn smarter — powered by Groq LLaMA, built with React + Node.js, and deployed on the cloud.

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-learnbot--ai.vercel.app-blueviolet?style=for-the-badge)](https://learnbot-ai-pied.vercel.app)
[![Backend API](https://img.shields.io/badge/⚙️%20API-render.com-46E3B7?style=for-the-badge)](https://learnbot-ai-mc1y.onrender.com)

</div>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🧠 **AI Chat** | Powered by Groq LLaMA — blazing fast AI responses |
| 🔐 **Auth System** | JWT-based secure login & signup |
| 📧 **Email Support** | Nodemailer integration for notifications |
| 💾 **Cloud Database** | MongoDB Atlas — scalable & always-on |
| ⏰ **Cron Jobs** | Scheduled background tasks |
| 📱 **Responsive UI** | Works on mobile, tablet, desktop |

---

## 🛠️ Tech Stack

### Frontend
```
React 18      →  UI Framework
Vite 5        →  Build Tool (lightning fast)
Groq API      →  LLaMA AI Model
Vercel        →  Deployment
```

### Backend
```
Node.js       →  Runtime
Express.js    →  Web Framework
MongoDB       →  Database (Atlas)
Mongoose      →  ODM
JWT           →  Authentication
Nodemailer    →  Email Service
Render        →  Deployment
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key

### 1. Clone the repo
```bash
git clone https://github.com/Pragati7058/Learnbot-AI.git
cd Learnbot-AI
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
CRON_SECRET=your_cron_secret
APP_URL=http://localhost:5000
```

```bash
node index.js
```

### 3. Setup Frontend
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [learnbot-ai-pied.vercel.app](https://learnbot-ai-pied.vercel.app) |
| Backend | Render | [learnbot-ai-mc1y.onrender.com](https://learnbot-ai-mc1y.onrender.com) |
| Database | MongoDB Atlas | Cloud hosted |

---

## 📁 Project Structure

```
Learnbot-AI/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Node.js Backend
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── index.js
│
└── README.md
```

---

## 👩‍💻 Author

<div align="center">

**Pragati Jadhav**

[![Portfolio](https://img.shields.io/badge/Portfolio-pragati7058.github.io-ff69b4?style=for-the-badge)](https://pragati7058.github.io/portfolio/)
[![GitHub](https://img.shields.io/badge/GitHub-Pragati7058-181717?style=for-the-badge&logo=github)](https://github.com/Pragati7058)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-pragatijadhav7058-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/pragatijadhav7058)

*B.Tech CSE Student | Flutter & Full-Stack Developer*

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

⭐ **Star this repo if you found it helpful!**

</div>
