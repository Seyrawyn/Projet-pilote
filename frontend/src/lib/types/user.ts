export type User = {
  id?: number;
  trainerId?: number;
  username?: string;
  email?: string | null;
  name?: string | null;
  dateOfBirth?: string | null;
  height?: number | null;
  weight?: number | null;
  sex?: string | null;
  img?: string | null;
  description?: string | null;
  trainer?: User;
}
