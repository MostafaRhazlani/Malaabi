import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { GuardService } from '@/services/guard.service';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function GuardScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return <View className="flex-1 bg-black items-center justify-center"><ActivityIndicator color="#10B981" /></View>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950 px-8">
        <Text className="text-white text-center text-lg font-bold mb-4">We need camera access to scan tickets</Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-emerald-500 px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-black">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const result = await GuardService.verifyToken(data);
      Alert.alert(
        "Verification Successful",
        `Booking for ${result.player.first_name} ${result.player.last_name} is now CONFIRMED.`,
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || "Invalid or expired ticket";
      Alert.alert(
        "Verification Failed",
        message,
        [{ text: "Try Again", onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
            barcodeTypes: ["qr"],
        }}
      />

      {/* Foreground Overlay */}
      <View className="flex-1 items-center justify-center bg-black/40">
           {/* Scan Frame */}
           <View className="items-center justify-center">
              <View 
                style={{ width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }}
                className="border-2 border-primary-500 rounded-3xl items-center justify-center overflow-hidden"
              >
                {loading && <ActivityIndicator size="large" color="#10B981" />}
              </View>
              
              <View className="mt-8 overflow-hidden">
                 <Text className="text-white font-bold tracking-widest uppercase text-xs">Align QR Code within frame</Text>
              </View>
           </View>

           {/* Manual Reset Button if stuck */}
           {scanned && !loading && (
             <TouchableOpacity 
               onPress={() => setScanned(false)}
               className="absolute bottom-16 bg-white/20 px-8 py-4 rounded-full border border-white/30"
             >
                <Text className="text-white font-bold">Tap to Scan Again</Text>
             </TouchableOpacity>
           )}
      </View>
    </View>
  );
}
