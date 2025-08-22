const fs = require("fs");

const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
const mode = process.argv[2]; // "enable" o "disable"

if (!appJson.expo.plugins) appJson.expo.plugins = [];

const isAuth0 = (p) =>
  (typeof p === "string" && p === "react-native-auth0") ||
  (Array.isArray(p) && p[0] === "react-native-auth0");

appJson.expo.plugins = appJson.expo.plugins.filter((p) => !isAuth0(p));

if (mode === "enable") {
  appJson.expo.plugins.push(["react-native-auth0", { domain: "auth.patrimore.com" }]);
  console.log("✔ Añadido react-native-auth0");
} else {
  console.log("✔ Eliminado react-native-auth0");
}

fs.writeFileSync("app.json", JSON.stringify(appJson, null, 2));
