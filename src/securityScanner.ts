// DevShieldX Security Scanner

export type Issue = {
  message: string;
  index: number;
  severity: "high" | "medium" | "low";
  fix?: string;
};

export function findSecurityIssues(code: string): Issue[] {
  const issues: Issue[] = [];
  let match: RegExpExecArray | null;

  const rules = [
    {
      regex: /eval\s*\((.*?)\)/g,
      message: "Avoid using eval() — can execute arbitrary code",
      severity: "high",
      fix: "remove-eval",
    },
    {
      regex: /\.innerHTML\s*=/g,
      message: "Possible XSS: avoid assigning to innerHTML",
      severity: "high",
      fix: "replace-innerHTML",
    },
    {
      regex: /document\.write\s*\(/g,
      message: "Avoid document.write — unsafe DOM manipulation",
      severity: "medium",
      fix: "remove-document-write",
    },
    {
      regex: /setTimeout\s*\(\s*['"`]/g,
      message: "Avoid string execution in setTimeout",
      severity: "medium",
    },
    {
      regex: /const\s+\w+\s*=\s*['"`].*(api|key|token|secret).*['"`]/gi,
      message: "Hardcoded secret detected",
      severity: "high",
    },
  ];

  rules.forEach((rule) => {
    while ((match = rule.regex.exec(code))) {
      issues.push({
        message: rule.message,
        index: match.index,
        severity: rule.severity as "high" | "medium" | "low",
        fix: (rule as any).fix,
      });
    }
  });

  return issues;
}
