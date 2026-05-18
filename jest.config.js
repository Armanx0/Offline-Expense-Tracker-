module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  transformIgnorePatterns: [
    "[\\\\/]node_modules[\\\\/](?!((?:\\.pnpm|(?:jest-)?react-native|@react-native|@react-navigation|expo|@expo|expo-router|react-native-paper)))",
    "[\\\\/]node_modules[\\\\/]\\.pnpm[\\\\/](?!((?:jest-)?react-native|@react-native\\+[^\\\\/]+|@react-navigation\\+[^\\\\/]+|expo(?:-[^\\\\/]+)?|@expo\\+[^\\\\/]+|expo-router|react-native-paper)@)"
  ]
};
