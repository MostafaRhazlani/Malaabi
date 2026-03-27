import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Switch, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconSymbol } from '../ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { teamService } from '@/services/team.service';

interface CreateTeamModalProps {
  isVisible: boolean;
  onClose: () => void;
  onTeamCreated?: () => void;
}

export function CreateTeamModal({ isVisible, onClose, onTeamCreated }: CreateTeamModalProps) {
  const { isDark } = useColorScheme();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    maxMembers: 5,
    isPublic: true,
    logo: null as string | null,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm(prev => ({ ...prev, logo: result.assets[0].uri }));
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    setLoading(true);
    try {
      await teamService.createTeam({
        name: form.name,
        description: form.description,
        maxMembers: form.maxMembers,
        isPublic: form.isPublic,
        logo: form.logo,
      });
      
      Alert.alert('Success', 'Team created successfully!');
      onTeamCreated?.();
      onClose();
      // Reset form
      setForm({
        name: '',
        description: '',
        maxMembers: 10,
        isPublic: true,
        logo: null,
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white dark:bg-slate-900 rounded-t-[40px] h-[90%]"
        >
          <View className="p-6 flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black dark:text-white">Create New Squad</Text>
              <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <IconSymbol name="xmark" size={20} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Logo Picker */}
              <View className="items-center mb-8">
                <TouchableOpacity 
                  onPress={pickImage}
                  activeOpacity={0.8}
                  className="w-28 h-28 bg-theme-light-card dark:bg-theme-dark-card rounded-3xl items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
                >
                  {form.logo ? (
                    <Image source={{ uri: form.logo }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="items-center">
                      <IconSymbol name="camera.fill" size={32} color="#94A3B8" />
                      <Text className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Team Logo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View className="gap-y-6">
                <View>
                  <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase tracking-wider">Team Name</Text>
                  <View className="w-full h-[56px] border border-gray-200 dark:border-gray-800 rounded-2xl bg-theme-light-card dark:bg-theme-dark-card">
                    <TextInput
                      className="flex-1 px-5 text-[15px] text-gray-900 dark:text-white"
                      placeholder="e.g. Atlas Lions Jr"
                      placeholderTextColor="#94A3B8"
                      value={form.name}
                      onChangeText={text => setForm(prev => ({ ...prev, name: text }))}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase tracking-wider">Description</Text>
                  <View className="w-full min-h-[100px] border border-gray-200 dark:border-gray-800 rounded-2xl bg-theme-light-card dark:bg-theme-dark-card px-2">
                    <TextInput
                      className="flex-1 p-3 text-[15px] text-gray-900 dark:text-white"
                      placeholder="What's your squad about?"
                      placeholderTextColor="#94A3B8"
                      multiline
                      textAlignVertical="top"
                      value={form.description}
                      onChangeText={text => setForm(prev => ({ ...prev, description: text }))}
                    />
                  </View>
                </View>

                {/* Members Stepper */}
                <View>
                  <View className="flex-row justify-between items-center mb-2 px-1">
                    <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Members</Text>
                    <View className="bg-theme-light-tint/10 dark:bg-theme-dark-tint/10 px-3 py-1 rounded-full">
                       <Text className="text-theme-light-tint dark:text-theme-dark-tint font-bold">{form.maxMembers} / 20</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between border border-gray-200 dark:border-gray-800 p-2 rounded-2xl bg-theme-light-card dark:bg-theme-dark-card">
                    <TouchableOpacity 
                      onPress={() => setForm(prev => ({ ...prev, maxMembers: Math.max(5, prev.maxMembers - 1) }))}
                      className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl items-center justify-center shadow-sm"
                    >
                      <IconSymbol name="minus" size={20} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    
                    <View className="items-center">
                       <Text className="text-2xl font-black dark:text-white">{form.maxMembers}</Text>
                       <Text className="text-[10px] text-slate-400 uppercase font-bold">Players</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => setForm(prev => ({ ...prev, maxMembers: Math.min(20, prev.maxMembers + 1) }))}
                      className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl items-center justify-center shadow-sm"
                    >
                      <IconSymbol name="plus" size={20} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Privacy Switch */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="font-bold text-[16px] dark:text-white">{form.isPublic ? 'Public Team' : 'Private Team'}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {form.isPublic ? 'Anyone can join immediately' : 'Requests must be approved by the leader'}
                    </Text>
                  </View>
                  <Switch
                    value={form.isPublic}
                    onValueChange={val => setForm(prev => ({ ...prev, isPublic: val }))}
                    trackColor={{ false: '#CBD5E1', true: isDark ? '#22C55E' : '#22C55E' }}
                  />
                </View>
              </View>

              <View className="h-20" />
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.8}
              className={`w-full h-[56px] rounded-2xl items-center justify-center mb-6 shadow-sm ${loading ? 'bg-slate-300' : 'bg-theme-light-tint dark:bg-theme-dark-tint'}`}
            >
              {loading ? (
                <ActivityIndicator color={isDark ? "#000" : "#fff"} />
              ) : (
                <Text className="text-black dark:text-white font-black text-lg">CREATE SQUAD</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
