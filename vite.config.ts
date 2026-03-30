import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { appendLeadToGoogleSheet } from './lib/googleSheets';
import type { GoogleSheetsEnv } from './lib/googleSheets';

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
          const result = await appendLeadToGoogleSheet(env as GoogleSheetsEnv, requestBody);
          sendJson(res, 200, result);
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
