module.exports = function withConditionalAuth0(config) {
    if (process.env.EXPO_AUTH0_ENABLED === "true") {
      config.plugins = [
        ...(config.plugins || []),
        [
          "react-native-auth0",
          {
            domain: "auth.patrimore.com",
          },
        ],
      ];
    }
    return config;
  };