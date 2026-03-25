import * as vscode from "vscode";
import { findSecurityIssues } from "./securityScanner";
import { DevShieldCodeActionProvider } from "./codeActions";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("DevShieldX is ACTIVE 🚀");

  const collection = vscode.languages.createDiagnosticCollection("devshieldx");

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
  );

  function updateStatusBar(count: number) {
    statusBar.text = `🛡️ DevShieldX: ${count} issues`;
    statusBar.show();
  }

  const updateDiagnostics = (document: vscode.TextDocument) => {
    if (
      ![
        "javascript",
        "typescript",
        "javascriptreact",
        "typescriptreact",
      ].includes(document.languageId)
    ) {
      return;
    }

    const text = document.getText();
    const issues = findSecurityIssues(text);

    const diagnostics: vscode.Diagnostic[] = [];

    issues.forEach((issue) => {
      const start = document.positionAt(issue.index);
      const end = document.positionAt(issue.endIndex);

      const range = new vscode.Range(start, end);

      let severity = vscode.DiagnosticSeverity.Warning;

      if (issue.severity === "high") {
        severity = vscode.DiagnosticSeverity.Error;
      }

      const diagnostic = new vscode.Diagnostic(range, issue.message, severity);

      // important for fixes
      diagnostic.code = issue.fixType || "security-issue";

      diagnostics.push(diagnostic);
    });

    collection.set(document.uri, diagnostics);
    updateStatusBar(diagnostics.length);
  };

  // on change
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      updateDiagnostics(e.document);
    }),
  );

  // on open
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {updateDiagnostics(editor.document);}
    }),
  );

  // 🚀 initial run
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  // 💡 Quick Fix
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      new DevShieldCodeActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      },
    ),
  );

  context.subscriptions.push(statusBar);
}

export function deactivate() {}
