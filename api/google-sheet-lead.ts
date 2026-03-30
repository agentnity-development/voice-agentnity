import { appendLeadToGoogleSheet } from '../lib/googleSheets';
import type { GoogleSheetsEnv } from '../lib/googleSheets';

async function parseRequestBody(req: any) {
  if (typeof req.body === 'string') {
    return req.body ? JSON.parse(req.body) : {};
  }

  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const rawBody = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

  return rawBody ? JSON.parse(rawBody) : {};
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  try {
    const requestBody = await parseRequestBody(req);
    const result = await appendLeadToGoogleSheet(process.env as GoogleSheetsEnv, requestBody);
    res.status(200).json(result);
  } catch (error) {
    console.error('Google Sheets lead sync failed.', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Something went wrong while saving the lead to Google Sheets.',
    });
  }
}
