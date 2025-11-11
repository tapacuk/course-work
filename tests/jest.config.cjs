module.exports = {
  rootDir: "..",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tests/tsconfig.json",
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^course-work-bll$": "<rootDir>/bll/src/index.ts",
    "^course-work-bll/(.*)$": "<rootDir>/bll/src/$1",
    "^course-work-dal$": "<rootDir>/dal/src/index.ts",
    "^course-work-dal/(.*)$": "<rootDir>/dal/src/$1",

    "^src/(.*)$": "<rootDir>/bll/src/$1",
  },
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: [
    "<rootDir>/bll/src/services/*.ts",
    "!<rootDir>/bll/src/services/searchHelper.ts",
    "!<rootDir>/bll/src/**/*.d.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html"],
};
