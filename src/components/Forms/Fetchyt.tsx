// // import { useEffect } from 'react';
// import { useRouter } from 'next/router';
// import { OAuth2Client } from 'google-auth-library';

// export default function Home() {
//   const router = useRouter();

//   const startOAuthFlow = async () => {
//     const oauth2Client = new OAuth2Client(
//       process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//       process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
//       process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
//     );

//     // Generate the authorization URL
//     const authUrl = oauth2Client.generateAuthUrl({
//       access_type: 'offline', // Request a refresh token
//       scope: ['https://www.googleapis.com/auth/youtube.force-ssl'], 
//     });

//     router.push(authUrl);
//   };

//   return (
//     <div>
//       <h1>YouTube Transcript Fetcher</h1>
//       <button onClick={startOAuthFlow}>Sign in with Google</button>
//     </div>
//   );
// }