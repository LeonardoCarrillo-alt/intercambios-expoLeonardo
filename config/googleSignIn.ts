import { GoogleSignin } from "@react-native-google-signin/google-signin"

export const googleSignIn = () => {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
    })
}