import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    // Step 1: Authenticate with OAuth
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();

    // Step 2: Fetch captions for the video
    const captionsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions`,
      {
        params: {
          part: 'snippet',
          videoId: videoId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (captionsResponse.data.items.length === 0) {
      return res.status(404).json({ error: 'No captions available for this video' });
    }

    const captionId = captionsResponse.data.items[0].id;

    // Step 3: Download the caption file
    const transcriptResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/plain', // Request the transcript in plain text
        },
      }
    );

    res.status(200).json({ transcript: transcriptResponse.data });
  } catch (error: any) {
    console.error('Error fetching captions:', (error as any).response?.data || (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
}