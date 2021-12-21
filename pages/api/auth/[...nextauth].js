import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyAPI, { LOGIN_URL } from "../../../lib/spotify";

//return refreshed_token, if the original token is expired
const refreshAccessToken = async (token) => {
  try {
    spotifyAPI.setAccessToken(token.accessToken);
    spotifyAPI.setRefreshToken(token.refreshToken);

    //refreshAccessToken() is default from spotify object
    const { body: refreshedToken } = await spotifyAPI.refreshAccessToken();
    console.log("REFRESHED TOKEN IS", refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now + refreshedToken.expires_in + 1000, // = 1 hour as 3600 returns from spotify API
      // if there is refreshed_token, use that else, use token's refresh token
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,

  pages: {
    signIn: "/login",
  },

  //callback using jwt function
  callbacks: {
    async jwt({ token, account, user }) {
      // handles 3 scenarios

      //initial signin
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
        };
      }

      //Return previous token if the access token has not exired yet
      if (Date.now() < token.accessTokenExpires) {
        console.log("Existing token is valid");
        return token;
      }

      //access token has expires, refresh token
      console.log("Access token has expired, refreshing...");
      return await refreshAccessToken(token);
    },

    //  async function for session
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    },
  },
});
