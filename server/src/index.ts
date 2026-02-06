import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateRouter } from './routes/generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Static file serving for outputs
const outputDir = path.resolve(__dirname, '..', process.env.OUTPUT_DIR || './storage/output');
const archiveDir = path.resolve(__dirname, '..', process.env.ARCHIVE_DIR || './storage/archive');

app.use('/output', express.static(outputDir));
app.use('/archive', express.static(archiveDir));

// API routes
app.use('/api', generateRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`StyleSpace2 AI Server running on http://localhost:${PORT}`);
  console.log(`ComfyUI endpoint: ${process.env.COMFY_API_URL || 'http://127.0.0.1:8188'}`);
});
