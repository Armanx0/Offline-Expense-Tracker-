module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  transformIgnorePatterns: [
    "[\\\\/]node_modules[\\\\/](?!((jest-)?react-native|@react-native|@react-native[\\\\/]js-polyfills|expo|@expo|expo-router|react-native-paper|@react-navigation))",
    "[\\\\/]node_modules[\\\\/]\\.pnpm[\\\\/](?!(react-native|@react-native\\+js-polyfills|@react-native|expo|@expo|expo-router|react-native-paper|@react-navigation)@)"
  ]
};
