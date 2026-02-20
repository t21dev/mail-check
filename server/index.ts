import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkEmail } from './email-checker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

interface CheckBody {
  emails: string[];
}

app.post('/api/check', apiLimiter, async (req: Request<{}, {}, CheckBody>, res: Response) => {
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    res.status(400).json({ error: 'Please provide an array of emails' });
    return;
  }

  if (emails.length > 100) {
    res.status(400).json({ error: 'Maximum 100 emails per request' });
    return;
  }

  try {
    const results = await Promise.all(emails.map(email => checkEmail(email)));
    res.json({ results });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SPA fallback for production
app.get('/{*path}', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Email checker API running on http://localhost:${PORT}`);
});
