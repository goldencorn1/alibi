import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  paths: { sources: "./contracts", tests: "./test/contracts", artifacts: "./artifacts/contracts" },
};

export default config;
