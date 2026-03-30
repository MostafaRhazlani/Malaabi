import api from './api';
import { updateSession } from '@/helpers/session.helper';
import { updateUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

export const UserService = {
  async updateProfile(id: string, data: any, dispatch: AppDispatch) {
    const response = await api.patch(`/user/${id}`, data);
    const updatedUser = response.data;
    
    // Update store
    dispatch(updateUser({
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      profileImg: updatedUser.profile_img,
      birthDate: updatedUser.birth_date,
      position: updatedUser.position,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
    }));

    // Update persistent session
    await updateSession({
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      profileImg: updatedUser.profile_img,
      birthDate: updatedUser.birth_date,
      position: updatedUser.position,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
    });

    return updatedUser;
  },

  async uploadProfileImage(id: string, imageUri: string, dispatch: AppDispatch) {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await api.patch(`/user/${id}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data, // Essential for FormData in some axios setups
    });

    const updatedUser = response.data;
    
    // Update store
    dispatch(updateUser({ profileImg: updatedUser.profile_img }));

    // Update session
    await updateSession({ profileImg: updatedUser.profile_img });

    return updatedUser;
  }
};
