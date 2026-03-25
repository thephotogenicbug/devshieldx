# DevShieldX Code Security Scanner

<p align="center">
  <img src="https://raw.githubusercontent.com/thephotogenicbug/devshieldx/main/assets/icon.png" alt="DevShieldX Logo" width="120"/>
</p>

DevShieldX is a Visual Studio Code extension that detects common security vulnerabilities in JavaScript and TypeScript code using AST-based analysis. It provides real-time diagnostics and smart quick fixes directly inside the editor.

---

## Overview

Modern frontend and backend applications often contain subtle security risks such as unsafe DOM manipulation, dynamic code execution, and insecure API usage. DevShieldX helps developers identify and fix these issues early during development.

The extension analyzes source code using an Abstract Syntax Tree (AST), making detection more accurate than simple pattern matching.

---

## Key Features

### Security Detection

Detects common vulnerabilities:

- `eval()` usage (remote code execution risk)
- SQL injection (string concatenation and template queries)
- `innerHTML` assignments (XSS risk)
- `document.write` usage
- Unsafe `setTimeout` with string execution
- Hardcoded secrets (API keys, tokens)

---

### Real-Time Diagnostics

- Issues are highlighted as you type
- Integrated with VS Code Problems panel
- Precise highlighting using AST node ranges

---

### Smart Quick Fixes

- Replace `eval()` with safer alternatives
- Convert `innerHTML` to `textContent`
- Suggest parameterized SQL queries
- Remove unsafe `document.write`
- Convert `setTimeout` string execution to functions
- Replace hardcoded secrets with environment variables

---

### Developer Experience

- Hover explanations for security issues
- Status bar indicator showing issue count
- Clean, non-breaking code transformations
- Lightweight and fast scanning

---

## Supported Languages

- JavaScript (.js)
- TypeScript (.ts)
- React (.jsx, .tsx)

---

## Installation

### From Marketplace (Recommended)

Search for **DevShieldX Code Security Scanner** in the VS Code Extensions panel.

### Local Development

```bash
git clone https://github.com/thephotogenicbug/devshieldx
cd devshieldx
npm install
npm run compile
```

Run extension:

```bash
F5
```

---

## Usage

1. Open any JavaScript or TypeScript file
2. DevShieldX automatically scans the file
3. Issues appear highlighted in the editor
4. Hover over highlighted code to view details
5. Press:

```
Ctrl + .
```

to apply quick fixes

---

## Example

### Input Code

```js
eval(userInput);

element.innerHTML = userInput;

db.query("SELECT * FROM users WHERE id = " + userId);

setTimeout("alert('hack')", 1000);

const apiKey = "SECRET_KEY";
```

---

### Output After Fixes

```js
JSON.parse(userInput);

element.textContent = userInput;

db.query("SELECT * FROM users WHERE id = ?", [userId]);

setTimeout(() => {
  alert("alert message");
}, 1000);

const apiKey = process.env.API_KEY;
```

---

## Commands

| Command                             | Description                                 |
| ----------------------------------- | ------------------------------------------- |
| DevShieldX: Fix All Security Issues | Applies fixes to all detected issues (Beta) |

---

## How It Works

DevShieldX uses Babel’s parser and AST traversal to analyze code structure instead of relying on simple string matching.

This allows:

- Accurate detection of function calls and assignments
- Reduced false positives
- Context-aware fixes

---

## Known Limitations (Beta)

- Fixes may not preserve formatting in complex cases
- SQL fixes use generic parameterization
- No taint analysis (data flow tracking) yet
- Limited support for deeply nested expressions

---

## Roadmap

- AST-based precise transformations (node-level fixes)
- Taint analysis (track user input flow)
- Configurable rules system
- Project-wide scanning
- Custom rule support
- Advanced reporting UI

---

## Contributing

Contributions are welcome.

Steps:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## License

MIT License

---

## Author

Naveen Kumar

---

## Feedback

If you find bugs or have feature requests, please open an issue on GitHub.

---

## Keywords

security, vscode extension, javascript security, typescript security, xss, sql injection, code scanner, dev tools
