import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
  preset: "ts-jest",
  roots: ["<rootDir>/test/"],
  testEnvironment: "node",
  testRegex: "(/__test__/.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 30000,
};
export default config;
