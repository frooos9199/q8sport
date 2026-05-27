module.exports = {
  preset: 'react-native',
  testMatch: ['<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
    '<rootDir>/web/',
    '<rootDir>/build/',
    '<rootDir>/vendor/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/android/',
    '<rootDir>/ios/',
    '<rootDir>/web/',
    '<rootDir>/build/',
    '<rootDir>/vendor/',
  ],
};
