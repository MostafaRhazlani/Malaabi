export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export enum RequestType {
    REQUEST = 'REQUEST',
    INVITATION = 'INVITATION'
}

export interface Player {
    id: string;
    first_name: string;
    last_name: string;
    profile_img?: string;
    position?: string;
    birth_date?: string | Date;
    team?: {
        id: string;
        name: string;
    } | null;
}

export interface TeamJoinRequest {
    id: string;
    teamId: string;
    team?: Team;
    playerId: string;
    player?: Player;
    status: RequestStatus;
    type: RequestType;
    createdAt: string | Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  image?: any; // For backward compatibility with require() mocks
  maxMembers?: number;
  isPublic?: boolean;
  hasPendingJoinRequest?: boolean;
  leaderId?: string;
  leader?: Player;
  members?: Player[];
  requests?: TeamJoinRequest[];
  _count?: {
    members: number;
    requests?: number;
  };
}
