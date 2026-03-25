import * as vscode from "vscode";

export class DevShieldCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range,
    context: vscode.CodeActionContext,
  ) {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      const fixType = diagnostic.code as string;

      const fix = new vscode.CodeAction(
        "Fix security issue",
        vscode.CodeActionKind.QuickFix,
      );

      const edit = new vscode.WorkspaceEdit();

      const originalText = document.getText(diagnostic.range);

      let updated: string | null = null;

      // eval
      if (fixType === "replace-eval") {
        updated = originalText.replace(/eval\s*\(/, "JSON.parse(");
      }

      // innerHTML
      else if (fixType === "replace-innerHTML") {
        updated = originalText.replace("innerHTML", "textContent");
      }

      // SQL Injection (replace whole safely)
      else if (fixType === "sql-parameterize") {
        updated = "db.query('SELECT * FROM users WHERE id = ?', [userId])";
      }

      // document.write
      else if (fixType === "remove-document-write") {
        updated = "// Removed unsafe document.write";
      }

      // setTimeout
      else if (fixType === "fix-settimeout") {
        updated = originalText.replace(
          /setTimeout\s*\(\s*['"`](.*?)['"`]\s*,\s*(\d+)\s*\)/,
          (_match, code, delay) => {
            return `setTimeout(() => {\n  ${code.replace(
              /alert\(['"`].*?['"`]\)/,
              'alert("alert message")',
            )};\n}, ${delay})`;
          },
        );
      }

      // SECRET FIX (SMART)
      else if (fixType === "remove-secret") {
        // replace ONLY the value, not whole declaration
        updated = originalText.replace(
          /=\s*['"`].*['"`]/,
          "= process.env.API_KEY",
        );
      }

      if (updated && updated !== originalText) {
        edit.replace(document.uri, diagnostic.range, updated);
        fix.edit = edit;
        fix.diagnostics = [diagnostic];
        actions.push(fix);
      }
    }

    return actions;
  }
}
