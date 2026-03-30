const HOOMAN_TASK_URL = 'https://api.hoomanlabs.com/routes/v1/tasks/';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const apiKey = process.env.HOOMAN_API_KEY;
  const agentId = process.env.HOOMAN_AGENT_ID;
  const campaignId = process.env.HOOMAN_CAMPAIGN;

  if (!apiKey || !agentId || !campaignId) {
    res.status(500).json({ message: 'Missing Hooman server configuration.' });
    return;
  }

  try {
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const payload = {
      ...requestBody,
      agent: agentId,
      campaign: campaignId,
    };

    const response = await fetch(HOOMAN_TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      res.status(response.status).json(data ?? { message: `Hooman request failed with status ${response.status}` });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Something went wrong while creating the Hooman task.',
    });
  }
}
