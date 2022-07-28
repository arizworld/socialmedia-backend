"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Sync object
const config = {
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
exports.default = config;
//# sourceMappingURL=jest.config.js.map