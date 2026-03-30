import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { UserService } from '@/services/user.service';
import { BASE_URL } from '@/services/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const getAvatarUri = (profileImg?: string | null) => {
  if (!profileImg) return null;
  if (profileImg.startsWith('http')) return profileImg;
  return `${BASE_URL}${profileImg}`;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { isDark } = useColorScheme();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState(user?.position || '');
  const [birthDate, setBirthDate] = useState(user?.birthDate ? new Date(user.birthDate) : new Date());
  const [gender, setGender] = useState(user?.gender || '');
  const [image, setImage] = useState<string | null>(getAvatarUri(user?.profileImg));
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Modal State for Position/Gender
  const [selectConfig, setSelectConfig] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    labels?: string[];
    value: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    value: '',
    onSelect: () => {},
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openSelect = (config: any) => {
    setSelectConfig({ ...config, visible: true });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep iOS open if needed
    if (selectedDate) {
      setBirthDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const updateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      };

      if (phone) updateData.phone = phone.trim();
      if (position) updateData.position = position;
      if (gender) updateData.gender = gender;
      
      if (birthDate) {
        updateData.birth_date = birthDate.toISOString();
      }

      await UserService.updateProfile(user.id, updateData, dispatch);
      
      const currentAvatar = getAvatarUri(user?.profileImg);
      if (image && image !== currentAvatar) {
        await UserService.uploadProfileImage(user.id, image, dispatch);
      }
      
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const themeColors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView className="flex-1 bg-theme-light-background dark:bg-theme-dark-background" edges={['top', 'bottom']}>
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <IconSymbol name="chevron.left" size={20} color={themeColors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-2 mb-8">
          <TouchableOpacity onPress={pickImage} className="relative p-1 border border-slate-300 dark:border-slate-700 rounded-full">
            <View className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                source={image ? { uri: image } : require('@/assets/images/football-player.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </View>
            <View className="absolute bottom-0 right-1 bg-slate-900 dark:bg-white w-7 h-7 rounded-full items-center justify-center border-2 border-white dark:border-slate-950">
              <IconSymbol name="plus" size={14} color={isDark ? '#000' : '#fff'} weight="bold" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-6">
          <EditField label="First Name" value={firstName} onChangeText={setFirstName} placeholder="First Name" iconName="pencil" color={themeColors.icon} />
          <EditField label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Last Name" iconName="pencil" color={themeColors.icon} />
          <EditField label="Email" value={user?.email || ''} editable={false} placeholder="Email" iconName="envelope.fill" color={themeColors.icon} />
          <EditField label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone Number" iconName="phone.fill" color={themeColors.icon} />
          
          <SelectField 
            label="Position" 
            value={position || 'Select Position'} 
            iconName="person.fill" 
            color={themeColors.icon} 
            onPress={() => openSelect({
              title: 'Select Position',
              options: ['GK', 'DEF', 'MID', 'FWD'],
              value: position,
              onSelect: setPosition
            })}
          />

          <SelectField 
            label="Birth Date" 
            value={birthDate ? birthDate.toISOString().split('T')[0] : 'Select Date'} 
            iconName="calendar" 
            color={themeColors.icon} 
            onPress={() => setShowDatePicker(true)}
          />
          
          <SelectField 
            label="Gender" 
            value={gender ? (gender === 'MALE' ? 'Male' : 'Female') : 'Select Gender'} 
            iconName="person.fill.viewfinder" 
            color={themeColors.icon} 
            onPress={() => openSelect({
              title: 'Select Gender',
              options: ['MALE', 'FEMALE'],
              labels: ['Male', 'Female'],
              value: gender,
              onSelect: setGender
            })}
          />
        </View>
        <View className="h-10" />
      </ScrollView>

      <View className="flex-row items-center justify-between px-6 pb-6 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 py-[18px] bg-theme-light-card dark:bg-theme-dark-card items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 mr-2"
        >
          <Text className="text-theme-light-text dark:text-theme-dark-text font-bold text-base">Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`flex-1 py-[18px] items-center justify-center rounded-full ml-2 flex-row bg-theme-light-tint dark:bg-theme-dark-tint`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white dark:text-black font-bold text-base">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Overlay */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide">
            <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setShowDatePicker(false)}>
              <View className="bg-white dark:bg-slate-900 p-6 pb-12 rounded-t-[32px]">
                <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full self-center mb-6" />
                <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6">Select Birth Date</Text>
                <DateTimePicker
                  value={birthDate || new Date()}
                  mode="date"
                  display="inline"
                  onChange={onDateChange}
                  maximumDate={new Date()} // Prevent picking future dates 
                  themeVariant={isDark ? 'dark' : 'light'}
                />
                <TouchableOpacity 
                   className="mt-6 py-4 bg-theme-light-tint dark:bg-theme-dark-tint rounded-full items-center"
                   onPress={() => setShowDatePicker(false)}
                >
                   <Text className="text-white dark:text-black font-bold">Done</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        ) : (
          <DateTimePicker
            value={birthDate || new Date()}
            mode="date"
            display="calendar"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )
      )}

      {/* Select Modal */}
      <Modal
        visible={selectConfig.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectConfig(prev => ({ ...prev, visible: false }))}
      >
        <Pressable 
          className="flex-1 bg-black/40 justify-end" 
          onPress={() => setSelectConfig(prev => ({ ...prev, visible: false }))}
        >
          <View className="bg-white dark:bg-slate-900 rounded-t-[32px] p-6 pb-12">
            <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full self-center mb-6" />
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6">{selectConfig.title}</Text>
            
            {selectConfig.options.map((option, index) => {
              const isSelected = selectConfig.value === option;
              const label = selectConfig.labels ? selectConfig.labels[index] : option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    selectConfig.onSelect(option);
                    setSelectConfig(prev => ({ ...prev, visible: false }));
                  }}
                  className={`flex-row items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/60 ${isSelected ? 'opacity-100' : 'opacity-60'}`}
                >
                  <Text className={`text-lg font-semibold ${isSelected ? 'text-theme-light-tint dark:text-theme-dark-tint' : 'text-slate-900 dark:text-white'}`}>
                    {label}
                  </Text>
                  {isSelected && <IconSymbol name="checkmark" size={20} color={isDark ? Colors.dark.tint : Colors.light.tint} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const EditField = ({ label, value, onChangeText, iconName, placeholder, color, editable = true }: any) => {
  return (
    <View className="flex-row items-center border-b border-slate-50 dark:border-slate-800/60 py-4">
      <View className="flex-1">
        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          editable={editable}
          className={`text-base font-semibold p-0 ${editable ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
          placeholderTextColor="#9ca3af"
        />
      </View>
      <View className="ml-4 opacity-80">
        <IconSymbol name={iconName} size={20} color={color} />
      </View>
    </View>
  );
}

const SelectField = ({ label, value, onPress, iconName, color }: any) => {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center border-b border-slate-50 dark:border-slate-800/60 py-4">
      <View className="flex-1">
        <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</Text>
        <Text className="text-base font-semibold text-slate-900 dark:text-white">{value}</Text>
      </View>
      <View className="ml-4 opacity-80 flex-row items-center">
        <View className="mr-2">
           <IconSymbol name="chevron.right" size={16} color={color} />
        </View>
        <IconSymbol name={iconName} size={20} color={color} />
      </View>
    </TouchableOpacity>
  );
}
