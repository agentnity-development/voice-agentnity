import { createSign } from 'node:crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const DEFAULT_RANGE = 'Leads!A:J';
const SHEET_HEADERS = [
  'Submitted At',
  'Name',
  'Phone',
  'Use Case',
  'Task ID',
  'Status',
  'Source',
  'Current Date',
  'Current Time',
  'Error',
];

type GoogleTokenResponse = {
  access_token?: string;
  error_description?: string;
  error?: string;
};

type GoogleSheetValuesResponse = {
  values?: string[][];
};

type GoogleSheetMetadataResponse = {
  sheets?: Array<{
    properties?: {
      sheetId?: number;
      title?: string;
    };
  }>;
};

type GoogleSheetAppendResponse = {
  updates?: unknown;
  message?: string;
  error?: unknown;
};

export type GoogleSheetsEnv = {
  GOOGLE_SHEETS_SPREADSHEET_ID?: string;
  GOOGLE_SHEET_ID?: string;
  GOOGLE_SHEETS_RANGE?: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
};

export type GoogleSheetsLeadPayload = {
  name?: string;
  phone?: string;
  useCase?: string;
  taskId?: string;
  status?: string;
  source?: string;
  currentDate?: string;
  currentTime?: string;
  error?: string;
};

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function parseSheetTitle(range: string) {
  const [sheetTitle = 'Leads'] = range.split('!');
  return sheetTitle.replace(/^'/, '').replace(/'$/, '');
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function extractGoogleErrorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const payload = data as {
    message?: unknown;
    error?: unknown;
  };

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error;
  }

  if (payload.error && typeof payload.error === 'object') {
    const nestedError = payload.error as {
      message?: unknown;
      status?: unknown;
    };

    if (typeof nestedError.message === 'string' && nestedError.message.trim()) {
      return nestedError.message;
    }

    if (typeof nestedError.status === 'string' && nestedError.status.trim()) {
      return nestedError.status;
    }
  }

  return fallback;
}

export async function getGoogleAccessToken(clientEmail: string, privateKey: string) {
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

  const data = await response.json().catch(() => null) as GoogleTokenResponse | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description || data?.error || 'Failed to get Google Sheets access token.');
  }

  return data.access_token;
}

async function fetchGoogleJson<T>(url: string, init: RequestInit, fallbackMessage: string) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractGoogleErrorMessage(data, fallbackMessage));
  }

  return (data ?? {}) as T;
}

async function ensureSheetStructure(accessToken: string, spreadsheetId: string, range: string) {
  const sheetTitle = parseSheetTitle(range);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const metadata = await fetchGoogleJson<GoogleSheetMetadataResponse>(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(sheetId,title)`,
    { headers },
    'Failed to read Google Sheets metadata.'
  );

  const matchingSheet = metadata.sheets?.find((sheet) => sheet.properties?.title === sheetTitle);
  const sheetId = matchingSheet?.properties?.sheetId;

  if (sheetId === undefined) {
    throw new Error(`Sheet tab "${sheetTitle}" was not found. Check GOOGLE_SHEETS_RANGE.`);
  }

  const headerRow = await fetchGoogleJson<GoogleSheetValuesResponse>(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetTitle}!1:1`)}`,
    { headers },
    'Failed to read Google Sheets header row.'
  );

  const firstRow = headerRow.values?.[0] ?? [];
  const normalizedFirstRow = firstRow.map((cell) => String(cell).trim().toLowerCase());
  const hasAnyFirstRowContent = firstRow.some((cell) => String(cell).trim().length > 0);
  const hasHeaders = SHEET_HEADERS.every((header, index) => normalizedFirstRow[index] === header.toLowerCase());

  if (!hasHeaders) {
    if (hasAnyFirstRowContent) {
      await fetchGoogleJson(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                insertDimension: {
                  range: {
                    sheetId,
                    dimension: 'ROWS',
                    startIndex: 0,
                    endIndex: 1,
                  },
                  inheritFromBefore: false,
                },
              },
            ],
          }),
        },
        'Failed to insert Google Sheets header row.'
      );
    }

    await fetchGoogleJson(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetTitle}!A1:J1`)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [SHEET_HEADERS] }),
      },
      'Failed to create Google Sheets header row.'
    );
  }

  await fetchGoogleJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: SHEET_HEADERS.length,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.07,
                    green: 0.13,
                    blue: 0.25,
                  },
                  horizontalAlignment: 'CENTER',
                  textFormat: {
                    foregroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1,
                    },
                    bold: true,
                    fontSize: 10,
                  },
                },
              },
              fields: 'userEnteredFormat',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: SHEET_HEADERS.length,
              },
            },
          },
        ],
      }),
    },
    'Failed to format Google Sheet.'
  );

  return { sheetTitle };
}

export async function appendLeadToGoogleSheet(env: GoogleSheetsEnv, payload: GoogleSheetsLeadPayload) {
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID || env.GOOGLE_SHEET_ID;
  const range = env.GOOGLE_SHEETS_RANGE || DEFAULT_RANGE;
  const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error('Missing Google Sheets server configuration. Add GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.');
  }

  const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
  const { sheetTitle } = await ensureSheetStructure(accessToken, spreadsheetId, range);
  const values = [[
    formatSubmittedAt(new Date()),
    payload.name || '',
    payload.phone || '',
    payload.useCase || '',
    payload.taskId || '',
    payload.status || '',
    payload.source || 'hero_form',
    payload.currentDate || '',
    payload.currentTime || '',
    payload.error || '',
  ]];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetTitle}!A:J`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ values }),
    }
  );

  const data = await response.json().catch(() => null) as GoogleSheetAppendResponse | null;

  if (!response.ok) {
    throw new Error(extractGoogleErrorMessage(data, `Google Sheets request failed with status ${response.status}`));
  }

  return {
    success: true,
    updates: data?.updates ?? null,
  };
}
