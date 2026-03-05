import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import LottieView from 'lottie-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {

    return (
        <SafeAreaView className="flex-1">
            <ThemedView className="flex-1 w-full px-8 items-center pt-16 pb-8">
                {/* Top Brand Name */}
                <ThemedText type='title' className="text-5xl font-extrabold mb-12">
                    malaabi<Text className="text-primary-600">.</Text>
                </ThemedText>

                {/* Center Illustration */}
                <View className="flex mb-10 justify-center items-center w-full">
                    <View className="relative items-center">
                        {/* Lottie Football Animation */}
                        <View className="mt-8 overflow-hidden elevation-5 w-[300px] h-[300px]">
                            <LottieView
                                source={require('@/assets/animations/Football_team_players.json')}
                                autoPlay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                    </View>
                </View>

                {/* Login Buttons */}
                <View className="flex-1 w-full gap-4">
                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-primary-600 py-5 rounded-full px-6 elevation-2"
                        activeOpacity={0.8}
                    >
                        <View className="w-5 h-5 justify-center items-center opacity-90">
                            <GoogleIcon />
                        </View>
                        <Text className="flex-1 text-center text-[13px] font-bold text-white tracking-[2px] uppercase mr-5">
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-[#3b5998] py-5 rounded-full px-6 elevation-2"
                        activeOpacity={0.8}
                    >
                        <View className="w-5 h-5 justify-center items-center opacity-90">
                            <FacebookIcon />
                        </View>
                        <Text className="flex-1 text-center text-[13px] font-bold text-white tracking-[2px] uppercase mr-5">
                            Login with Facebook
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <ThemedText className="text-[13px] mt-8i text-center px-4 leading-6">
                    By continue you agree to our{"\n"}
                    <ThemedText className="font-bold">Terms & Privacy Policy</ThemedText>
                </ThemedText>
            </ThemedView>
        </SafeAreaView>
    );
}

/* ---------- SVG Icon Components ---------- */

function GoogleIcon() {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#ffffff" />
            <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" />
            <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#ffffff" />
            <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" />
        </Svg>
    );
}

function FacebookIcon() {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path
                d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                fill="#ffffff"
            />
        </Svg>
    );
}
