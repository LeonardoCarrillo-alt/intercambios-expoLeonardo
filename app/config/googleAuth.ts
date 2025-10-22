import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'intercambios',
  path: 'redirect',
});

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '7268380927-01b7tobicprkor2it30sm6vc806t6da1.apps.googleusercontent.com',
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  return { request, response, promptAsync };
};