# OPTIMISTIC EMPIRE

A data bundle sales platform for Ghana mobile networks (MTN, Telecel, AirtelTigo).

## Features

- Buy data bundles for all Ghana networks
- Secure payments via Paystack (Card & Mobile Money)
- Wallet system for quick purchases
- Transaction history
- Admin dashboard
- Mobile-responsive design

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Payments:** Paystack

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Paystack account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/optimistic-empire.git
cd optimistic-empire
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. Configure environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values
```

4. Seed the database:
```bash
cd backend && node seedBundles.js
```

5. Start development servers:
```bash
# From root directory
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Backend (Render)

1. Push to GitHub
2. Connect repo to Render
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Frontend (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set root directory to `frontend`
4. Add `REACT_APP_API_URL` environment variable
5. Deploy

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
VTU_API_URL=https://...
VTU_API_KEY=your_key
VTU_USER_ID=your_id
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## License

MIT
