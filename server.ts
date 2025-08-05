import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
import { Pool } from 'pg';
import cors from 'cors';
import { authMiddleware, Role } from './src/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post('/api/generate-sql', authMiddleware([Role.USER, Role.ADMIN]), async (req, res) => {
  const { question, schema } = req.body;

  try {
    const prompt = `Convert this natural language question to SQL. Schema: ${schema}. Question: ${question}`;

    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 200,
      temperature: 0,
    });

    const sql = response.data.choices[0].text?.trim();
    res.json({ sql });
  } catch (error) {
    console.error('Error generating SQL:', error);
    res.status(500).json({ error: 'Error generating SQL' });
  }
});

app.post('/api/execute-sql', authMiddleware([Role.ADMIN]), async (req, res) => {
  const { sql } = req.body;

  if (!sql.toLowerCase().startsWith('select')) {
    return res.status(403).json({ error: 'Only SELECT statements are allowed.' });
  }

  try {
    const result = await pool.query(sql);
    res.json({ rows: result.rows });
  } catch (error) {
    console.error('SQL execution error:', error);
    res.status(500).json({ error: 'Error executing SQL' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// File: src/auth.ts
import { Request, Response, NextFunction } from 'express';

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

export interface AuthRequest extends Request {
  user?: { role: Role }
}

export const authMiddleware = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.headers['x-user-role'] as Role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = { role };
    next();
  }
};
