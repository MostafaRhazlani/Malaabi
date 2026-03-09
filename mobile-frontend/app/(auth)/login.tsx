import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useState } from "react";
import { AuthService } from "@/services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const role = await AuthService.login(email.trim(), password);
      if (role === null) {
        setError("Login failed. Please try again.");
      } else if (role !== "PLAYER") {
        await AuthService.logout();
        setError("Access denied. Only players can access this app.");
      } else {
        router.replace("/");
      }
    } catch (e: unknown) {
      const res = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = res?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8 pt-16">

            {/* Logo area */}
            <View className="w-full items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/30 items-center justify-center mb-4">
                <View className="w-14 h-14 rounded-full items-center justify-center shadow-lg">
                  <Image source={require("@/assets/images/malaabi-logo.png")} className="w-14 h-14" />
                </View>
              </View>

              <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                Welcome back
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                Please enter your details to sign in.
              </Text>
            </View>

            {/* Social Logins */}
            <View className="flex-row gap-4 mt-4 w-full justify-between">
              <TouchableOpacity className="flex-1 h-[56px] rounded-2xl border border-gray-200 dark:border-gray-800 justify-center items-center bg-white dark:bg-zinc-900">
                <FontAwesome name="apple" size={24} color={isDark ? "white" : "black"} />
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-[56px] rounded-2xl border border-gray-200 dark:border-gray-800 justify-center items-center bg-white dark:bg-zinc-900">
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-[56px] rounded-2xl border border-gray-200 dark:border-gray-800 justify-center items-center bg-white dark:bg-zinc-900">
                <FontAwesome name="twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
            </View>

            {/* OR Divider */}
            <View className="flex-row items-center w-full my-8">
              <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
              <Text className="px-4 text-gray-400 dark:text-gray-500 font-medium text-sm">OR</Text>
              <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
            </View>

            {/* Inputs */}
            <View className="w-full gap-4">
              {error && (
                <Text className="text-red-500 text-center text-sm">{error}</Text>
              )}

              <View className="w-full h-[56px] border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900">
                <TextInput
                  className="flex-1 px-5 text-[15px] text-gray-900 dark:text-white"
                  placeholder="Enter your email..."
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View className="flex-row items-center w-full h-[56px] border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900 px-5">
                <TextInput
                  className="flex-1 text-[15px] text-gray-900 dark:text-white pb-1"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  style={{
                    letterSpacing: !showPassword && password.length > 0 ? 5 : 0,
                    // Fix iOS password dot alignment
                    paddingTop: Platform.OS === 'ios' ? 0 : undefined
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Options */}
            <View className="flex-row justify-between w-full my-6 items-center px-1">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View className={`w-[20px] h-[20px] rounded-[6px] border items-center justify-center flex
                  ${rememberMe ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text className="text-gray-900 dark:text-white font-medium text-[15px]">Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900 dark:text-white font-semibold text-[15px] underline">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Action */}
            <TouchableOpacity
              className="w-full h-[56px] bg-[#111111] dark:bg-white rounded-2xl items-center justify-center mb-8 shadow-sm"
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={isDark ? "black" : "white"} size="small" />
              ) : (
                <Text className="text-white dark:text-black text-[16px] font-semibold">
                  Sign in
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-[15px]">
                Don&apos;t have an account yet?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-black dark:text-white font-bold text-[15px]">Sign Up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
