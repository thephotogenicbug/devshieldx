import * as vscode from "vscode";

export class DevShieldCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
  ) {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      const message = diagnostic.message;
      const originalText = document.getText(diagnostic.range);

      let fix: vscode.CodeAction | null = null;
      const edit = new vscode.WorkspaceEdit();

      // eval fix
      if (message.includes("eval")) {
        fix = new vscode.CodeAction(
          "Replace eval() with JSON.parse()",
          vscode.CodeActionKind.QuickFix,
        );

        const updated = originalText.replace("eval", "JSON.parse");
        edit.replace(document.uri, diagnostic.range, updated);
      }

      // innerHTML fix
      else if (message.includes("innerHTML")) {
        fix = new vscode.CodeAction(
          "Replace innerHTML with textContent",
          vscode.CodeActionKind.QuickFix,
        );

        const updated = originalText.replace("innerHTML", "textContent");
        edit.replace(document.uri, diagnostic.range, updated);
      }

      // SQL Injection fix
      else if (message.includes("SQL Injection")) {
        fix = new vscode.CodeAction(
          "Use parameterized query",
          vscode.CodeActionKind.QuickFix,
        );

        edit.replace(
          document.uri,
          diagnostic.range,
          "db.query('SELECT * FROM users WHERE id = ?', [userId])",
        );
      }

      // document.write fix
      else if (message.includes("document.write")) {
        fix = new vscode.CodeAction(
          "Remove unsafe document.write",
          vscode.CodeActionKind.QuickFix,
        );

        edit.replace(
          document.uri,
          diagnostic.range,
          "// Removed unsafe document.write",
        );
      }

      // setTimeout string fix
      else if (message.includes("setTimeout")) {
        fix = new vscode.CodeAction(
          "Convert string to function",
          vscode.CodeActionKind.QuickFix,
        );

        const updated = originalText.replace(
          /setTimeout\s*\(\s*['"`](.*?)['"`]\s*,/g,
          "setTimeout(() => { $1 },",
        );

        edit.replace(document.uri, diagnostic.range, updated);
      }

      // hardcoded secret fix
      else if (message.includes("Hardcoded secret")) {
        fix = new vscode.CodeAction(
          "Move secret to environment variable",
          vscode.CodeActionKind.QuickFix,
        );

        edit.replace(
          document.uri,
          diagnostic.range,
          "const API_KEY = process.env.API_KEY;",
        );
      }

      // APPLY FIX
      if (fix) {
        fix.edit = edit;
        fix.diagnostics = [diagnostic];
        actions.push(fix);
      }
    }

    return actions;
  }
}
