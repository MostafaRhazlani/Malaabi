const NGROK_URL = "https://unsimpering-jinny-unexcused.ngrok-free.dev";
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || NGROK_URL;

console.log("URL running is:", BASE_URL);