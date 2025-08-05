import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const USERS: Record<string, 'admin' | 'user'> = {
  'admin@example.com': 'admin',
  'user@example.com': 'user',
};

function isSelectQuery(sql: string): boolean {
  return /^\s*SELECT\s/i.test(sql);
}

app.post('/api/nl-to-sql', async (req, res) => {
  const { email, question } = req.body;

  if (!email || !question) return res.status(400).json({ error: 'Missing parameters' });
  const role = USERS[email];
  if (!role) return res.status(403).json({ error: 'Unauthorized user' });

  try {
    const prompt = `Translate the following question into a SQL SELECT query:
"${question}"
SQL:`;
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 100,
      temperature: 0,
    });

    const query = response.data.choices[0].text?.trim();
    if (!query || !isSelectQuery(query)) return res.status(400).json({ error: 'Invalid SQL generated' });

    const result = await pool.query(query);
    res.json({ query, preview: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => console.log(`Chat2SQL server running on port ${PORT}`));