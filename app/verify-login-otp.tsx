import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Colors } from "@/constants/theme";
import { supabase } from "@/utils/supabase";
import { Toast } from "toastify-react-native";

export default function VerifyLoginOtp() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    // Get email and password from navigation params or sessionStorage
    const storedEmail = typeof window !== "undefined" && window.sessionStorage 
      ? window.sessionStorage.getItem("login_email") 
      : null;
    const storedPassword = typeof window !== "undefined" && window.sessionStorage 
      ? window.sessionStorage.getItem("login_password") 
      : null;
    
    const emailParam = params.email as string;
    const finalEmail = storedEmail || emailParam;
    const finalPassword = storedPassword;
    
    if (finalEmail) setEmail(finalEmail);
    if (finalPassword) setPassword(finalPassword);

    if (!finalEmail || !finalPassword) {
      Alert.alert("Error", "Missing email or password. Please try logging in again.");
      router.replace("/welcome");
    }
  }, [params]);

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      Alert.alert("Error", "OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP with backend
      const verifyResponse = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        Alert.alert("Error", errorData.detail || "Failed to verify OTP");
        setLoading(false);
        return;
      }

      // Step 2: OTP verified - now sign in with Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        Alert.alert("Error", signInError.message || "Failed to sign in");
        setLoading(false);
        return;
      }

      // Step 3: Clear stored credentials
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem("login_email");
        window.sessionStorage.removeItem("login_password");
      }
      
      Toast.success("Logged in successfully!", "bottom");
      router.replace("/(tabs)/");
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      Toast.success("OTP has been resent to your email", "bottom");
    } catch (error) {
      console.error("Resend OTP error:", error);
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor }}>
      <View style={{ flex: 1, paddingHorizontal: 30, paddingTop: 60, justifyContent: "center" }}>
        {/* Header */}
        <View style={{ marginBottom: 40 }}>
          <ThemedText type="title" style={{ marginBottom: 12, textAlign: "center" }}>
            Verify Your Identity
          </ThemedText>
          <ThemedText type="subtitle" style={{ textAlign: "center", color: "#6B7280" }}>
            Enter the 6-digit code sent to {email}
          </ThemedText>
        </View>

        {/* OTP Input */}
        <View style={{ marginBottom: 24 }}>
          <ThemedInput
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            style={{ fontSize: 24, letterSpacing: 8 }}
          />
        </View>

        {/* Verify Button */}
        <ThemedButton
          variant="primary"
          onPress={handleVerifyOtp}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              Verify OTP
            </ThemedText>
          )}
        </ThemedButton>

        {/* Resend Link */}
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={loading}
          style={{ marginTop: 16, alignItems: "center" }}
        >
          <ThemedText style={{ color: Colors.light.tint, textDecorationLine: "underline" }}>
            Didn't receive code? Resend
          </ThemedText>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace("/welcome")}
          disabled={loading}
          style={{ marginTop: 24 }}
        >
          <ThemedText style={{ textAlign: "center", color: "#6B7280" }}>
            Back to Login
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
