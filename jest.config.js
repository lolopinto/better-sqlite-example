module.exports = {
  testEnvironment: "node",
  transform: {
    // works!
    "^.+\\.tsx?$": ["ts-jest"],
    // "^.+\\.tsx?$": ["@swc/jest"],
  },
  testRegex: "(/tests/.*|(\\.|/)(test|spec))\\.(tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
