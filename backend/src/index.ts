import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Monad API v1.0.0' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
