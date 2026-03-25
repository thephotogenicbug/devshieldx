import * as vscode from "vscode";
import { findSecurityIssues } from "./securityScanner";
import { DevShieldCodeActionProvider } from "./codeActions";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("DevShieldX is ACTIVE 🚀");

  const collection = vscode.languages.createDiagnosticCollection("devshieldx");

  // Status bar
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
  );

  const updateStatusBar = (issuesCount: number) => {
    statusBar.text = `🛡️ DevShieldX: ${issuesCount} issues`;
    statusBar.show();
  };

  context.subscriptions.push(statusBar);

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

      const start = document.positionAt(issue.index);
      const end = document.positionAt(issue.index + 20); // small range

      const range = new vscode.Range(start, end);

      let severity = vscode.DiagnosticSeverity.Warning;

      if (issue.severity === "high") {
        severity = vscode.DiagnosticSeverity.Error;
      }

      const diagnostic = new vscode.Diagnostic(range, issue.message, severity);

      // CRITICAL: link fix
      diagnostic.code = issue.fixType || "security-issue";

      diagnostics.push(diagnostic);
    });

    collection.set(document.uri, diagnostics);
    updateStatusBar(diagnostics.length);
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
  // Hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      {
        provideHover(document, position) {
          const text = document.getText();
          const issues = findSecurityIssues(text);

          for (const issue of issues) {
            const start = document.positionAt(issue.index);
            const end = document.positionAt(issue.index + 20);
            const range = new vscode.Range(start, end);

            if (range.contains(position)) {
              return new vscode.Hover(
                `🚨 ${issue.message}\n\n💡 Security Risk: ${issue.severity.toUpperCase()}`,
              );
            }
          }
        },
      },
    ),
  );
}

export function deactivate() {}
