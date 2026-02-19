// pages/api/verify-beta.js

const VALID_CODES = [
  'KTRIX-7F3K9M',
  'KTRIX-B2N8P4',
  'KTRIX-D5Q1W6',
  'KTRIX-H9L3X7',
  'KTRIX-J4R8Y2',
  'KTRIX-M6T2Z5',
  'KTRIX-P1V9A3',
  'KTRIX-S8C4E6',
  'KTRIX-U3G7F1',
  'KTRIX-W5K2H8',
  'KTRIX-X9N6J4',
  'KTRIX-Z1R3L7',
  'KTRIX-A4T8M2',
  'KTRIX-C6V5P9',
  'KTRIX-E2W1Q3',
  'KTRIX-G8Y4S6',
  'KTRIX-K3Z7U1',
  'KTRIX-L5A9V4',
  'KTRIX-N7B2X8',
  'KTRIX-Q1D6F3',
];

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ valid: false, error: 'No code provided' });
  }

  const isValid = VALID_CODES.includes(code.toUpperCase().trim());

  return res.status(200).json({ valid: isValid });
}
