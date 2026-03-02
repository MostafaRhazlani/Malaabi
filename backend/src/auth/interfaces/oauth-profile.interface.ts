export interface OAuthProfile {
  provider: 'GOOGLE' | 'FACEBOOK';
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  providerId: string;
  picture: string | null;
}
