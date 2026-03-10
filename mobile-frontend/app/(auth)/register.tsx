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
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { ROUTES } from "@/constants/routes";

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await AuthService.register(
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        password,
      );
      if (!result) {
        setError("Registration failed. Please try again.");
      } else if (result.role === 'PLAYER') {
        dispatch(setUser({ email: result.email, role: result.role }));
        router.replace(ROUTES.PLAYER);
      } else {
        await AuthService.logout();
        setError("Access denied. Only players can register.");
      }
    } catch (e: unknown) {
      const res = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = res?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? "Registration failed. Please try again."));
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
                Create Account
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base">
                Please enter your details to sign up.
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

            {/* Inputs Form */}
            <View className="w-full gap-4 mb-8">
              {error && (
                <Text className="text-red-500 text-center text-sm">{error}</Text>
              )}

              <View className="flex-row gap-4 w-full h-[56px]">
                <View className="flex-1 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900 justify-center">
                  <TextInput
                    className="px-5 text-[15px] text-gray-900 dark:text-white"
                    placeholder="First Name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoComplete="given-name"
                  />
                </View>
                <View className="flex-1 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900 justify-center">
                  <TextInput
                    className="px-5 text-[15px] text-gray-900 dark:text-white"
                    placeholder="Last Name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    autoComplete="family-name"
                  />
                </View>
              </View>

              <View className="w-full h-[56px] border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900 justify-center">
                <TextInput
                  className="px-5 text-[15px] text-gray-900 dark:text-white"
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
                  autoComplete="new-password"
                  style={{
                    letterSpacing: !showPassword && password.length > 0 ? 5 : 0,
                    paddingTop: Platform.OS === 'ios' ? 0 : undefined
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center w-full h-[56px] border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-zinc-900 px-5">
                <TextInput
                  className="flex-1 text-[15px] text-gray-900 dark:text-white pb-1"
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  style={{
                    letterSpacing: !showConfirmPassword && confirmPassword.length > 0 ? 5 : 0,
                    paddingTop: Platform.OS === 'ios' ? 0 : undefined
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action */}
            <TouchableOpacity
              className="w-full h-[56px] bg-[#111111] dark:bg-white rounded-2xl items-center justify-center mb-8 shadow-sm"
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={isDark ? "black" : "white"} size="small" />
              ) : (
                <Text className="text-white dark:text-black text-[16px] font-semibold">
                  Sign up
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-[15px]">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-black dark:text-white font-bold text-[15px]">Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
