import axios from 'axios';
import api, { BASE_URL } from './api';
import { Team } from '@/interfaces/team.interface';

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
    return response.data;
  },

  getMyTeams: async (): Promise<Team[]> => {
    const response = await api.get('/player/teams/my-teams');
    return response.data;
  },

  getTeamDetails: async (id: string): Promise<Team> => {
    const response = await api.get(`/player/teams/${id}`);
    return response.data;
  },
};
