export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  image?: any; // For backward compatibility with require() mocks
  maxMembers?: number;
  isPublic?: boolean;
  leader?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  members?: { id: string }[];
  _count?: {
    members: number;
  };
}
