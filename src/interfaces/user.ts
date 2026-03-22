export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  linkedInProfile?: string | null;
  bio?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
