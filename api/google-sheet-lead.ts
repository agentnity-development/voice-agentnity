import { appendLeadToGoogleSheet } from '../lib/googleSheets';
import type { GoogleSheetsEnv } from '../lib/googleSheets';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  try {
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const result = await appendLeadToGoogleSheet(process.env as GoogleSheetsEnv, requestBody);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Something went wrong while saving the lead to Google Sheets.',
    });
  }
}
