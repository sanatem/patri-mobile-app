const fs = require("fs");
const path = require("path");

const appJsonPath = path.resolve(__dirname, "..", "app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
const mode = process.argv[2];

if (!appJson.expo.plugins) appJson.expo.plugins = [];

const isAuth0 = (p) =>
  (typeof p === "string" && p === "react-native-auth0") ||
  (Array.isArray(p) && p[0] === "react-native-auth0");

appJson.expo.plugins = appJson.expo.plugins.filter((p) => !isAuth0(p));

if (mode === "enable") {
  appJson.expo.plugins.push(["react-native-auth0", { domain: "auth.patrimore.com" }]);
} else {
}

fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
