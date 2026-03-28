import api from './api';
import { Team, Player, TeamJoinRequest } from '@/interfaces/team.interface';

const toFlatPlayer = (raw: any): Player => {
  const player = raw?.player ?? raw;

  return {
    id: player?.id || '',
    first_name: player?.first_name || '',
    last_name: player?.last_name || '',
    profile_img: player?.profile_img,
    position: player?.position,
    birth_date: player?.birth_date,
  };
};

export interface CreateTeamData {
  name: string;
  description?: string;
  maxMembers: number;
  isPublic: boolean;
  logo?: any;
}

export const teamService = {
  createTeam: async (data: CreateTeamData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    formData.append('maxMembers', data.maxMembers.toString());
    formData.append('isPublic', data.isPublic.toString());

    if (data.logo) {
      const uri = data.logo;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('logo', {
        uri,
        name: filename,
        type,
      } as any);
    }

    const response = await api.post('/player/teams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllTeams: async (): Promise<Team[]> => {
    const response = await api.get('/player/teams');
    return (response.data || []).map((team: any) => ({
      ...team,
      leader: team.leader ? {
        id: team.leader.id,
        first_name: team.leader.first_name,
        last_name: team.leader.last_name,
      } : null,
      members: (team.members || []).map((m: any) => ({ id: m.id })),
    }));
  },

  getMyTeams: async (): Promise<Team[]> => {
    const response = await api.get('/player/teams/my-teams');
    return (response.data || []).map((team: any) => ({
      ...team,
      leader: team.leader ? {
        id: team.leader.id,
        first_name: team.leader.first_name,
        last_name: team.leader.last_name,
      } : null,
      members: (team.members || []).map((m: any) => ({ id: m.id })),
    }));
  },

  getMySentRequests: async (): Promise<TeamJoinRequest[]> => {
    const response = await api.get('/player/teams/my-requests');
    return (response.data || []).map((request: any) => ({
      id: request.id,
      teamId: request.teamId,
      playerId: request.playerId,
      status: request.status,
      type: request.type,
      createdAt: request.createdAt,
      team: request.team
        ? {
            ...request.team,
            leader: request.team.leader
              ? {
                  id: request.team.leader.id,
                  first_name: request.team.leader.first_name,
                  last_name: request.team.leader.last_name,
                }
              : null,
            members: (request.team.members || []).map((m: any) => ({ id: m.id })),
          }
        : undefined,
    }));
  },

  cancelMySentRequest: async (requestId: string) => {
    const response = await api.post(`/player/teams/requests/${requestId}/cancel`);
    return response.data;
  },

  invitePlayer: async (teamId: string, playerId: string) => {
    const response = await api.post(`/player/teams/${teamId}/invite/${playerId}`);
    return response.data;
  },

  acceptMyInvitation: async (requestId: string) => {
    const response = await api.post(
      `/player/teams/requests/${requestId}/accept-invitation`,
    );
    return response.data;
  },

  rejectMyInvitation: async (requestId: string) => {
    const response = await api.post(
      `/player/teams/requests/${requestId}/reject-invitation`,
    );
    return response.data;
  },

  getTeamDetails: async (id: string): Promise<Team> => {
    const response = await api.get(`/player/teams/${id}`);
    const team = response.data;
    
    return {
      ...team,
      leader: team.leader ? {
        id: team.leader.id,
        first_name: team.leader.first_name,
        last_name: team.leader.last_name,
        profile_img: team.leader.profile_img,
        position: team.leader.position,
        birth_date: team.leader.birth_date,
      } : null,
      members: (team.members || []).map((m: any) => ({
        id: m.id,
        first_name: m.first_name,
        last_name: m.last_name,
        profile_img: m.profile_img,
        position: m.position,
        birth_date: m.birth_date,
      })),
    };
  },

  searchPlayers: async (name: string): Promise<Player[]> => {
    const response = await api.get('/player/teams/search-players', { params: { name } });
    return response.data;
  },

  joinTeam: async (teamId: string) => {
    const response = await api.post(`/player/teams/${teamId}/join`);
    return response.data;
  },

  leaveTeam: async (teamId: string) => {
    const response = await api.post(`/player/teams/${teamId}/leave`);
    return response.data;
  },

  expelMember: async (teamId: string, playerId: string) => {
    const response = await api.post(
      `/player/teams/${teamId}/members/${playerId}/expel`,
    );
    return response.data;
  },

  getTeamRequests: async (teamId: string): Promise<TeamJoinRequest[]> => {
    const response = await api.get(`/player/teams/${teamId}/requests`);
    return (response.data || []).map((request: any) => ({
      id: request.id,
      teamId: request.teamId,
      playerId: request.playerId,
      status: request.status,
      type: request.type,
      createdAt: request.createdAt,
      player: request.player ? toFlatPlayer(request.player) : undefined,
    }));
  },

  getTeamInvitations: async (teamId: string): Promise<string[]> => {
    const response = await api.get(`/player/teams/${teamId}/invitations`);
    return response.data || [];
  },

  acceptTeamRequest: async (teamId: string, playerId: string) => {
    const response = await api.post(
      `/player/teams/${teamId}/requests/${playerId}/accept`,
    );
    return response.data;
  },

  rejectTeamRequest: async (teamId: string, playerId: string) => {
    const response = await api.post(
      `/player/teams/${teamId}/requests/${playerId}/reject`,
    );
    return response.data;
  },

  cancelRecruit: async (teamId: string, playerId: string) => {
    const response = await api.post(
      `/player/teams/${teamId}/invite/${playerId}/cancel`,
    );
    return response.data;
  },



  updateTeam: async (id: string, data: Partial<CreateTeamData>) => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.maxMembers) formData.append('maxMembers', data.maxMembers.toString());
    if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    if (data.logo) {
      if (typeof data.logo === 'string' && data.logo.startsWith('http')) {
        // Logo is already an URL, do nothing or send as string if needed
      } else {
        const uri = data.logo;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append('logo', {
          uri,
          name: filename,
          type,
        } as any);
      }
    }

    const response = await api.post(`/player/teams/${id}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTeam: async (id: string) => {
    const response = await api.post(`/player/teams/${id}/delete`);
    return response.data;
  },
};
