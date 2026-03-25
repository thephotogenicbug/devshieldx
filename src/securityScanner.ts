import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export type Severity = "high" | "medium" | "low";

export interface SecurityIssue {
  message: string;
  index: number;
  severity: Severity;
  fixType?: string;
}

export function findSecurityIssues(code: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  let ast;

  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
    });
  } catch (err) {
    return issues; // avoid crash
  }

  traverse(ast, {
    CallExpression(path: NodePath<t.CallExpression>) {
      const callee = path.node.callee;

      if (t.isIdentifier(callee) && callee.name === "eval") {
        issues.push({
          message: "Avoid using eval() — can execute arbitrary code",
          index: path.node.start || 0,
          severity: "high",
          fixType: "replace-eval",
        });
      }

      // SQL Injection
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        ["query", "execute"].includes(callee.property.name)
      ) {
        const args = path.node.arguments;

        if (args.length > 0) {
          const firstArg = args[0];

          if (t.isBinaryExpression(firstArg)) {
            issues.push({
              message: "Possible SQL Injection (string concat)",
              index: path.node.start || 0,
              severity: "high",
              fixType: "sql-parameterize",
            });
          }

          if (
            t.isTemplateLiteral(firstArg) &&
            firstArg.expressions.length > 0
          ) {
            issues.push({
              message: "Possible SQL Injection (template literal)",
              index: path.node.start || 0,
              severity: "high",
              fixType: "sql-parameterize",
            });
          }
        }
      }
      // document.write
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        callee.object.name === "document" &&
        t.isIdentifier(callee.property) &&
        callee.property.name === "write"
      ) {
        issues.push({
          message: "Avoid document.write — unsafe DOM manipulation",
          index: path.node.start || 0,
          severity: "medium",
          fixType: "remove-document-write",
        });
      }
      // setTimeout string
      if (t.isIdentifier(callee) && callee.name === "setTimeout") {
        const args = path.node.arguments;

        if (args.length > 0 && t.isStringLiteral(args[0])) {
          issues.push({
            message: "Avoid string execution in setTimeout",
            index: path.node.start || 0,
            severity: "medium",
            fixType: "fix-settimeout",
          });
        }
      }
    },

    AssignmentExpression(path: NodePath<t.AssignmentExpression>) {
      const left = path.node.left;

      if (
        t.isMemberExpression(left) &&
        t.isIdentifier(left.property) &&
        left.property.name === "innerHTML"
      ) {
        issues.push({
          message: "Possible XSS: avoid innerHTML",
          index: path.node.start || 0,
          severity: "high",
          fixType: "replace-innerHTML",
        });
      }
    },
     // hardcoded secret detection
    VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
      const init = path.node.init;

      if (t.isStringLiteral(init)) {
        const value = init.value.toLowerCase();

        if (
          value.includes("key") ||
          value.includes("token") ||
          value.includes("secret")
        ) {
          issues.push({
            message: "Hardcoded secret detected",
            index: path.node.start || 0,
            severity: "high",
            fixType: "remove-secret",
          });
        }
      }
    },
  });

  return issues;
}
