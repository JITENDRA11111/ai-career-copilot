/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

function cppValue(type, value) {
  switch (type) {
    case "int":
      return `${value}`;

    case "long long":
      return `${value}LL`;

    case "double":
      return `${value}`;

    case "float":
      return `${value}`;

    case "bool":
      return value ? "true" : "false";

    case "string":
      return `"${value}"`;

    case "char":
      return `'${value}'`;

    case "vector<int>":
case "std::vector<int>":
  return `{${value.join(",")}}`;

case "vector<long long>":
case "std::vector<long long>":
  return `{${value.join(",")}}`;

case "vector<string>":
case "std::vector<string>":
  return `{${value.map(v => `"${v}"`).join(",")}}`;

case "vector<char>":
case "std::vector<char>":
  return `{${value.map(v => `'${v}'`).join(",")}}`;

    default:
      return JSON.stringify(value);
  }
}

function jsValue(value) {
  return JSON.stringify(value);
}

function pyValue(value) {
  return JSON.stringify(value);
}

/* -------------------------------------------------------------------------- */
/* C++ Wrapper */
/* -------------------------------------------------------------------------- */

export function buildCppWrapper(
  solutionCode,
  signature,
  testCase
) {
    console.log("===== buildCppWrapper =====");
console.log("signature =", signature);
console.log("type =", typeof signature);
console.log("parameters =", signature?.parameters);
console.log("isArray =", Array.isArray(signature?.parameters));
  const declarations = [];

  const argumentsList = [];

  for (const parameter of signature.parameters) {
    const name = parameter.name;
    const type = parameter.type;

    const value = testCase.input[name];

    declarations.push(
      `${type} ${name} = ${cppValue(
        type,
        value
      )};`
    );

    argumentsList.push(name);
  }

  return `
#include <bits/stdc++.h>
using namespace std;

template <typename T>
void printResult(const vector<T>& v) {
    cout << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        cout << v[i];
        if (i != v.size() - 1) cout << ",";
    }
    cout << "]";
}

template <typename T>
void printResult(const vector<vector<T>>& v) {
    cout << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        printResult(v[i]);
        if (i != v.size() - 1) cout << ",";
    }
    cout << "]";
}

inline void printResult(bool v) {
    cout << (v ? "true" : "false");
}

template <typename T>
void printResult(const T& v) {
    cout << v;
}

${solutionCode}

int main() {

${declarations.join("\n")}

auto answer =
${signature.functionName}(
${argumentsList.join(",")}
);

printResult(answer);

return 0;

}
`;
}

/* -------------------------------------------------------------------------- */
/* JavaScript Wrapper */
/* -------------------------------------------------------------------------- */

export function buildJavaScriptWrapper(
  solutionCode,
  signature,
  testCase
) {
  const declarations = [];

  const argumentsList = [];

  for (const parameter of signature.parameters) {
    const name = parameter.name;

    declarations.push(
      `const ${name} = ${jsValue(
        testCase.input[name]
      )};`
    );

    argumentsList.push(name);
  }

  return `
${solutionCode}

${declarations.join("\n")}

console.log(
${signature.functionName}(
${argumentsList.join(",")}
)
);
`;
}

/* -------------------------------------------------------------------------- */
/* Python Wrapper */
/* -------------------------------------------------------------------------- */

export function buildPythonWrapper(
  solutionCode,
  signature,
  testCase
) {
  const declarations = [];

  const argumentsList = [];

  for (const parameter of signature.parameters) {
    const name = parameter.name;

    declarations.push(
      `${name} = ${pyValue(
        testCase.input[name]
      )}`
    );

    argumentsList.push(name);
  }

  return `
${solutionCode}

${declarations.join("\n")}

print(
${signature.functionName}(
${argumentsList.join(",")}
)
)
`;
}