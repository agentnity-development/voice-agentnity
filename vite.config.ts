import { createSign } from 'node:crypto';
import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = toBase64Url(JSON.stringify({
    iss: clientEmail,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }));

  const unsignedToken = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(privateKey)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsignedToken}.${signature}`,
    }).toString(),
  });

  const data = await response.json().catch(() => null) as {
    access_token?: string;
    error_description?: string;
    error?: string;
  } | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.error || 'Failed to get Google Sheets access token.');
  }

  return data.access_token as string;
}

function sendJson(res: any, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function devGoogleSheetsProxy(env: Record<string, string>) {
  return {
    name: 'dev-google-sheets-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/google-sheet-lead', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { message: 'Method not allowed.' });
          return;
        }

        try {
          const body = await new Promise<string>((resolve, reject) => {
            const chunks: Buffer[] = [];

            req.on('data', (chunk: Buffer) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            req.on('error', reject);
          });

          const requestBody = body ? JSON.parse(body) : {};
          const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID || env.GOOGLE_SHEET_ID;
          const range = env.GOOGLE_SHEETS_RANGE || 'Leads!A:L';
          const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
          const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

          if (!spreadsheetId || !clientEmail || !privateKey) {
            sendJson(res, 500, {
              message: 'Missing Google Sheets server configuration. Add GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in .env.',
            });
            return;
          }

          const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
          const values = [[
            new Date().toISOString(),
            requestBody?.name || '',
            requestBody?.phone || '',
            requestBody?.email || '',
            requestBody?.courseInterested || requestBody?.useCase || '',
            requestBody?.city || '',
            requestBody?.taskId || '',
            requestBody?.status || '',
            requestBody?.source || 'hero_form',
            requestBody?.currentDate || '',
            requestBody?.currentTime || '',
            requestBody?.error || '',
          ]];

          const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ values }),
            }
          );

          const data = await response.json().catch(() => null) as {
            updates?: unknown;
            message?: string;
          } | null;

          if (!response.ok) {
            sendJson(res, response.status, data ?? { message: `Google Sheets request failed with status ${response.status}` });
            return;
          }

          sendJson(res, 200, { success: true, updates: data?.updates ?? null });
        } catch (error) {
          sendJson(res, 500, {
            message: error instanceof Error ? error.message : 'Something went wrong while saving the lead to Google Sheets.',
          });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), devGoogleSheetsProxy(env)],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api/hooman-task': {
          target: 'https://api.hoomanlabs.com',
          changeOrigin: true,
          rewrite: () => '/routes/v1/tasks/',
          headers: {
            Authorization: `Bearer ${env.VITE_HOOMAN_API_KEY || env.HOOMAN_API_KEY || ''}`,
          },
        },
      },
    },
  };
});
