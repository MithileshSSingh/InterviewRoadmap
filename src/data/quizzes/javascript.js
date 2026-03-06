const javascriptQuizzes = {
  "variables-data-types": {
    topicId: "variables-data-types",
    questions: [
      {
        id: "vdt-1",
        type: "code-output",
        question: "What will this code output?",
        code: `const obj = { name: "Alice" };
obj.name = "Bob";
console.log(obj.name);`,
        options: ['"Alice"', '"Bob"', "TypeError: Assignment to constant variable", "undefined"],
        correctAnswer: 1,
        explanation:
          "`const` prevents reassignment of the variable itself, but does not make the object immutable. Mutating a property like `obj.name = 'Bob'` is allowed.",
      },
      {
        id: "vdt-2",
        type: "multiple-choice",
        question: "Which of these is NOT a primitive data type in JavaScript?",
        options: ["string", "boolean", "array", "symbol"],
        correctAnswer: 2,
        explanation:
          "Array is not a primitive type -- it is an object. The 7 primitives are: string, number, bigint, boolean, undefined, null, and symbol.",
      },
      {
        id: "vdt-3",
        type: "true-false",
        question: '`typeof null` returns `"null"` in JavaScript.',
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          '`typeof null` returns `"object"`, not `"null"`. This is a well-known legacy bug in JavaScript that has never been fixed for backwards compatibility.',
      },
      {
        id: "vdt-4",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(x);
let x = 5;`,
        options: ["undefined", "5", "ReferenceError", "null"],
        correctAnswer: 2,
        explanation:
          "`let` and `const` are hoisted but not initialized. Accessing them before their declaration throws a ReferenceError due to the Temporal Dead Zone (TDZ).",
      },
      {
        id: "vdt-5",
        type: "multiple-choice",
        question: "What is the result of `typeof undefined === typeof null`?",
        options: ["true", "false", "TypeError", "undefined"],
        correctAnswer: 1,
        explanation:
          '`typeof undefined` is `"undefined"` and `typeof null` is `"object"`, so they are not equal. The expression evaluates to `false`.',
      },
    ],
  },

  operators: {
    topicId: "operators",
    questions: [
      {
        id: "op-1",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(0 == false);
console.log(0 === false);`,
        options: ["true, true", "true, false", "false, true", "false, false"],
        correctAnswer: 1,
        explanation:
          "`==` performs type coercion, so `0` is coerced to `false` (both are falsy), resulting in `true`. `===` checks type and value without coercion -- `0` is a number and `false` is a boolean, so it returns `false`.",
      },
      {
        id: "op-2",
        type: "multiple-choice",
        question: "Which operator should you prefer for equality checks in JavaScript?",
        options: ["== (loose equality)", "=== (strict equality)", "= (assignment)", "!= (loose inequality)"],
        correctAnswer: 1,
        explanation:
          "Strict equality (`===`) is preferred because it compares both value and type without implicit coercion, making your code more predictable and less bug-prone.",
      },
      {
        id: "op-3",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log("5" + 3);
console.log("5" - 3);`,
        options: ['"53", 2', '"53", "53"', "8, 2", '"8", "2"'],
        correctAnswer: 0,
        explanation:
          'The `+` operator with a string triggers string concatenation: `"5" + 3` becomes `"53"`. The `-` operator only works on numbers, so `"5"` is coerced to `5`, giving `5 - 3 = 2`.',
      },
      {
        id: "op-4",
        type: "true-false",
        question: "The `??` (nullish coalescing) operator treats `0` and `\"\"` as fallback-triggering values.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          '`??` only falls back for `null` and `undefined`. Unlike `||`, it does NOT treat `0`, `""`, or `false` as fallback values. This makes it ideal for cases where those are valid values.',
      },
      {
        id: "op-5",
        type: "code-output",
        question: "What will this code output?",
        code: `let a = 1;
let b = a++;
console.log(a, b);`,
        options: ["1, 1", "2, 1", "2, 2", "1, 2"],
        correctAnswer: 1,
        explanation:
          "The postfix `++` operator returns the original value first, then increments. So `b` gets `1` (original value of `a`), then `a` becomes `2`.",
      },
    ],
  },

  "strings-string-methods": {
    topicId: "strings-string-methods",
    questions: [
      {
        id: "str-1",
        type: "code-output",
        question: "What will this code output?",
        code: `const str = "Hello World";
console.log(str.slice(0, 5));
console.log(str.slice(-5));`,
        options: ['"Hello", "World"', '"Hello", "orld"', '"Hello", " Worl"', '"ello ", "World"'],
        correctAnswer: 0,
        explanation:
          '`slice(0, 5)` extracts characters from index 0 to 4, giving `"Hello"`. `slice(-5)` starts from 5 characters before the end, giving `"World"`.',
      },
      {
        id: "str-2",
        type: "true-false",
        question: "Strings in JavaScript are mutable -- you can change individual characters using bracket notation.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "Strings are immutable in JavaScript. `str[0] = 'h'` silently fails (or throws in strict mode). All string methods return new strings rather than modifying the original.",
      },
      {
        id: "str-3",
        type: "multiple-choice",
        question: "Which method would you use to check if a string contains a substring?",
        options: ["str.has()", "str.includes()", "str.contains()", "str.find()"],
        correctAnswer: 1,
        explanation:
          '`str.includes(substring)` returns `true` or `false`. `has()` is for Sets/Maps, `contains()` does not exist on strings, and `find()` is for arrays.',
      },
      {
        id: "str-4",
        type: "code-output",
        question: "What will this code output?",
        code: `const name = "Alice";
console.log(\`Hello, \${name.toUpperCase()}!\`);`,
        options: ['"Hello, Alice!"', '"Hello, ALICE!"', "Template literal error", '"Hello, ${name.toUpperCase()}!"'],
        correctAnswer: 1,
        explanation:
          'Template literals (backticks) evaluate expressions inside `${}`. `name.toUpperCase()` returns `"ALICE"`, so the result is `"Hello, ALICE!"`.',
      },
      {
        id: "str-5",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log("abc" === "abc");
console.log("abc" === new String("abc"));`,
        options: ["true, true", "true, false", "false, true", "false, false"],
        correctAnswer: 1,
        explanation:
          'Primitive strings compared with `===` check value equality. But `new String("abc")` creates a String object, not a primitive. `===` between a primitive and an object returns `false`.',
      },
    ],
  },

  "numbers-math": {
    topicId: "numbers-math",
    questions: [
      {
        id: "num-1",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(0.1 + 0.2 === 0.3);
console.log(0.1 + 0.2);`,
        options: ["true, 0.3", "false, 0.30000000000000004", "true, 0.30000000000000004", "false, 0.3"],
        correctAnswer: 1,
        explanation:
          "Due to IEEE 754 floating-point representation, `0.1 + 0.2` produces `0.30000000000000004`, not exactly `0.3`. This is a classic JavaScript gotcha.",
      },
      {
        id: "num-2",
        type: "true-false",
        question: "`NaN === NaN` evaluates to `true` in JavaScript.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "`NaN` is the only JavaScript value that is not equal to itself. `NaN === NaN` is `false`. Use `Number.isNaN()` to check for NaN.",
      },
      {
        id: "num-3",
        type: "multiple-choice",
        question: "Which method correctly converts the string `\"42.5\"` to a floating-point number?",
        options: ["Number.toFloat('42.5')", "parseFloat('42.5')", "Math.float('42.5')", "String.toNumber('42.5')"],
        correctAnswer: 1,
        explanation:
          '`parseFloat("42.5")` parses the string and returns `42.5`. You can also use `Number("42.5")` or the unary `+` operator (`+"42.5"`).',
      },
      {
        id: "num-4",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(typeof NaN);
console.log(typeof Infinity);`,
        options: ['"NaN", "Infinity"', '"number", "number"', '"undefined", "number"', '"NaN", "number"'],
        correctAnswer: 1,
        explanation:
          'Both `NaN` and `Infinity` are of type `"number"`. `NaN` stands for "Not a Number" but is paradoxically a numeric type in the IEEE 754 spec.',
      },
      {
        id: "num-5",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(parseInt("100", 2));`,
        options: ["100", "4", "2", "NaN"],
        correctAnswer: 1,
        explanation:
          '`parseInt("100", 2)` parses `"100"` as a base-2 (binary) number. Binary `100` = `1*4 + 0*2 + 0*1 = 4`.',
      },
    ],
  },

  "type-conversion-coercion": {
    topicId: "type-conversion-coercion",
    questions: [
      {
        id: "tc-1",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(Boolean(""));
console.log(Boolean("0"));
console.log(Boolean(0));`,
        options: ["false, false, false", "false, true, false", "true, true, false", "false, false, true"],
        correctAnswer: 1,
        explanation:
          'Empty string `""` is falsy, so `Boolean("")` is `false`. The string `"0"` is a non-empty string, so it is truthy -- `Boolean("0")` is `true`. The number `0` is falsy.',
      },
      {
        id: "tc-2",
        type: "multiple-choice",
        question: "Which of the following values is NOT falsy in JavaScript?",
        options: ["0", '""', "null", '"false"'],
        correctAnswer: 3,
        explanation:
          'The string `"false"` is truthy because it is a non-empty string. The 8 falsy values are: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`.',
      },
      {
        id: "tc-3",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log([] + []);
console.log([] + {});
console.log({} + []);`,
        options: [
          '"", "[object Object]", "[object Object]"',
          '"", "[object Object]", 0',
          '"undefined", "NaN", "NaN"',
          '"", "[object Object]", "[object Object]"',
        ],
        correctAnswer: 0,
        explanation:
          '`[] + []`: both arrays convert to empty strings, concatenation gives `""`. `[] + {}`: empty string + `"[object Object]"` gives `"[object Object]"`. `{} + []`: in most contexts, same as `[] + {}`, giving `"[object Object]"`.',
      },
      {
        id: "tc-4",
        type: "true-false",
        question: '`Number(null)` returns `NaN`.',
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "`Number(null)` returns `0`, not `NaN`. This is one of the surprising coercion rules. `Number(undefined)` returns `NaN`.",
      },
      {
        id: "tc-5",
        type: "code-output",
        question: "What will this code output?",
        code: `console.log(1 + "2" + 3);`,
        options: ["6", '"123"', '"33"', "15"],
        correctAnswer: 1,
        explanation:
          'JavaScript evaluates left to right. `1 + "2"` triggers string concatenation giving `"12"`. Then `"12" + 3` gives `"123"`.',
      },
    ],
  },

  "conditional-statements": {
    topicId: "conditional-statements",
    questions: [
      {
        id: "cs-1",
        type: "code-output",
        question: "What will this code output?",
        code: `const x = 10;
const result = x > 5 ? "big" : x > 0 ? "small" : "zero";
console.log(result);`,
        options: ['"big"', '"small"', '"zero"', "TypeError"],
        correctAnswer: 0,
        explanation:
          'The ternary evaluates left to right. `x > 5` is `true`, so `result` is `"big"`. The nested ternary is never evaluated.',
      },
      {
        id: "cs-2",
        type: "true-false",
        question: "In a `switch` statement, execution falls through to the next case if you omit the `break` keyword.",
        options: ["True", "False"],
        correctAnswer: 0,
        explanation:
          "Without `break`, execution continues into the next case block regardless of whether it matches. This is called fall-through behavior and is a common source of bugs.",
      },
      {
        id: "cs-3",
        type: "code-output",
        question: "What will this code output?",
        code: `const val = 0;
if (val) {
  console.log("truthy");
} else {
  console.log("falsy");
}`,
        options: ['"truthy"', '"falsy"', "undefined", "TypeError"],
        correctAnswer: 1,
        explanation:
          '`0` is a falsy value in JavaScript, so the `else` branch executes and logs `"falsy"`.',
      },
      {
        id: "cs-4",
        type: "multiple-choice",
        question: "What does the optional chaining operator `?.` do?",
        options: [
          "Throws an error if the value is null",
          "Returns undefined instead of throwing if a property access is on null/undefined",
          "Converts null to an empty object",
          "Checks if a variable is declared",
        ],
        correctAnswer: 1,
        explanation:
          "Optional chaining (`?.`) short-circuits and returns `undefined` if the left side is `null` or `undefined`, instead of throwing a TypeError.",
      },
      {
        id: "cs-5",
        type: "code-output",
        question: "What will this code output?",
        code: `switch (true) {
  case 1 === 1:
    console.log("A");
    break;
  case 2 > 1:
    console.log("B");
    break;
}`,
        options: ['"A"', '"B"', '"A" then "B"', "No output"],
        correctAnswer: 0,
        explanation:
          '`switch(true)` matches the first case whose expression evaluates to `true`. `1 === 1` is `true`, so it logs `"A"` and breaks.',
      },
    ],
  },

  loops: {
    topicId: "loops",
    questions: [
      {
        id: "lp-1",
        type: "code-output",
        question: "What will this code output?",
        code: `for (let i = 0; i < 3; i++) {
  // empty
}
console.log(typeof i);`,
        options: ['"number"', '"undefined"', "ReferenceError", "3"],
        correctAnswer: 2,
        explanation:
          "`let` in a `for` loop is block-scoped to the loop body. Outside the loop, `i` is not defined, so accessing it throws a ReferenceError.",
      },
      {
        id: "lp-2",
        type: "multiple-choice",
        question: "Which loop is best for iterating over the values of an array?",
        options: ["for...in", "for...of", "while", "do...while"],
        correctAnswer: 1,
        explanation:
          "`for...of` iterates over the values of an iterable (arrays, strings, etc.). `for...in` iterates over enumerable property keys (including inherited ones), which is meant for objects, not arrays.",
      },
      {
        id: "lp-3",
        type: "code-output",
        question: "What will this code output?",
        code: `let count = 0;
do {
  count++;
} while (count > 5);
console.log(count);`,
        options: ["0", "1", "5", "6"],
        correctAnswer: 1,
        explanation:
          "A `do...while` loop always executes the body at least once before checking the condition. `count` becomes `1`, then the condition `1 > 5` is `false`, so the loop stops.",
      },
      {
        id: "lp-4",
        type: "true-false",
        question: "`for...in` should be used to iterate over arrays because it gives you the index of each element.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation:
          "`for...in` iterates over all enumerable string-keyed properties, including inherited ones. It can produce unexpected results on arrays. Use `for...of` or `Array.forEach()` instead.",
      },
      {
        id: "lp-5",
        type: "code-output",
        question: "What will this code output?",
        code: `const arr = [10, 20, 30];
for (const [i, v] of arr.entries()) {
  if (i === 1) break;
}
console.log("done");`,
        options: ['"done"', "SyntaxError", "TypeError", "Infinite loop"],
        correctAnswer: 0,
        explanation:
          '`arr.entries()` yields `[index, value]` pairs. When `i === 1`, `break` exits the loop. The code then logs `"done"`. `break` works normally in `for...of` loops.',
      },
    ],
  },
};

export default javascriptQuizzes;
