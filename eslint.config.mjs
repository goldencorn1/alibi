import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const config = [globalIgnores(["output/**", "artifacts/**"]), ...nextVitals];

export default config;
