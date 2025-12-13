# MonadReview - AI-Assisted Review System

**MonadReview** is a decentralized, high-performance review platform built on Monad. It leverages AI to verify review authenticity and quality, rewarding users with MR tokens for helpful contributions.

## Features

- **AI-Powered Analysis**: Real-time feedback on review quality, tone, and helpfulness using local AI simulation.
- **Reputation System**: Verifiable reputation scores (0-1000) and badges (Expert, Verified, etc.) stored on-chain (mocked).
- **Instant Rewards**: Earn MR tokens for high-quality reviews.
- **Staking**: Stake MR tokens to boost reputation and unlock higher reward tiers.
- **Dashboard**: Track your reviews, earnings, and reputation growth.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4.
- **Blockchain**: Monad (Mocked for Demo).
- **AI**: Simple heuristic-based simulation for MVP.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Explore Demo Mode**:
   - The app defaults to a "Guest" view.
   - Click **"Enable Demo Mode"** in the Navbar or Dashboard to unlock the full reviewer experience with mock data.
   - Try the **"Write New Review"** feature in the Dashboard to see the AI feedback in action.

## Project Structure

- `src/components`: UI Components (Navbar, WriteReviewModal, etc.)
- `src/pages`: Main Views (Dashboard, Rewards, Profile, Landing)
- `src/services`: API types and mock services
- `src/context`: App state management (Demo mode, User User)

---
*Built for the Monad Hackathon*
