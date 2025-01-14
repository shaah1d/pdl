import { OAuth2Client } from 'google-auth-library';
import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query; // Authorization code from Google

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('Tokens:', tokens);

    // Store the refresh token securely (e.g., in a database)
    const refreshToken = tokens.refresh_token;
    console.log('Refresh Token:', refreshToken);

    // Redirect the user or send a success response
    res.status(200).json({ success: true, refreshToken });
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
}