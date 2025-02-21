export interface User {
  email: string;
  id: string;
  role: string;
  profileID: string;
  name: string;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
