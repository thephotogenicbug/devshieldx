import * as vscode from "vscode";

export class DevShieldCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
  ) {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.message.includes("eval")) {
        const fix = new vscode.CodeAction(
          "Replace eval() with safe alternative",
          vscode.CodeActionKind.QuickFix,
        );

        fix.edit = new vscode.WorkspaceEdit();

        // Replace eval(...) with safe placeholder
        fix.edit.replace(
          document.uri,
          diagnostic.range,
          "// TODO: Replace eval with safer logic",
        );

        fix.diagnostics = [diagnostic];
        actions.push(fix);
      }
    }

    return actions;
  }
}
