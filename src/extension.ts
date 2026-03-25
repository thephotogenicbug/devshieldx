import * as vscode from "vscode";
import { findSecurityIssues } from "./securityScanner";
import { DevShieldCodeActionProvider } from "./codeActions";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("DevShieldX is ACTIVE 🚀");
  console.log("DevShieldX is active");

  const collection = vscode.languages.createDiagnosticCollection("devshieldx");

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
      const position = document.positionAt(issue.index);

      const line = document.lineAt(position.line);
      const range = line.range;

      let severity = vscode.DiagnosticSeverity.Warning;

      if (issue.severity === "high") {
        severity = vscode.DiagnosticSeverity.Error;
      }

      const diagnostic = new vscode.Diagnostic(range, issue.message, severity);

      // CRITICAL: link fix
      diagnostic.code = issue.fix || "security-issue";

      diagnostics.push(diagnostic);
    });

    collection.set(document.uri, diagnostics);
  };

  // On change
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      updateDiagnostics(e.document);
    }),
  );

  // On open
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateDiagnostics(editor.document);
      }
    }),
  );

  // Run initially
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  // Register Quick Fix
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      new DevShieldCodeActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      },
    ),
  );

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
  );
  statusBar.text = "DevShieldX Active";
  statusBar.show();

  context.subscriptions.push(statusBar);
}

export function deactivate() {}
