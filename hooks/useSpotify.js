import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node"

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
})

function useSpotify() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      // If refresh access token is not valid anymore, redirect to login
      if (session.error === "RefreshAccessTokenError") {
        signIn();
      }

      // spotifyApi.setAccessToken(session.user.accessToken); - prima avevo questo ma non va
      spotifyApi.setAccessToken(session.accessToken);
    }
  }, [session]);

  return spotifyApi;
}

export default useSpotify;
