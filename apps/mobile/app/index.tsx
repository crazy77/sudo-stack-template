import { Database, ShieldCheck, Zap } from "lucide-react-native";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <View className="bg-white p-8 rounded-3xl shadow-sm items-center w-full max-w-md border border-gray-100">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          SUDO Stack
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          The ultimate boilerplate for Next.js, Expo, Supabase, and Drizzle.
        </Text>

        <View className="w-full flex-row items-center justify-between mb-4 bg-gray-50 p-4 rounded-2xl">
          <ShieldCheck size={28} color="#4F46E5" />
          <View className="flex-1 ml-4">
            <Text className="font-semibold text-gray-800">Supabase Auth</Text>
            <Text className="text-sm text-gray-500">
              Secure and simple authentication
            </Text>
          </View>
        </View>

        <View className="w-full flex-row items-center justify-between mb-4 bg-gray-50 p-4 rounded-2xl">
          <Database size={28} color="#059669" />
          <View className="flex-1 ml-4">
            <Text className="font-semibold text-gray-800">Drizzle ORM</Text>
            <Text className="text-sm text-gray-500">
              Type-safe queries across the stack
            </Text>
          </View>
        </View>

        <View className="w-full flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl">
          <Zap size={28} color="#D97706" />
          <View className="flex-1 ml-4">
            <Text className="font-semibold text-gray-800">oRPC API</Text>
            <Text className="text-sm text-gray-500">
              End-to-end typed RPC endpoints
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
