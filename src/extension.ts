'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import LineCount from './LineCount';
import { Disposable } from 'vscode';
import * as path from 'path';


export function activate(context: vscode.ExtensionContext) {

    let subscriptions: Disposable[] = [];
    let counter = new LineCount(context);
    context.subscriptions.push(counter);

    let status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100);
    statusBarText(0, 0);
    status.command = 'extension.linecount.showcommands';
    context.subscriptions.push(status);
    vscode.window.onDidChangeActiveTextEditor(onActiveEditorChange, this, subscriptions);
    let disposConfig = vscode.workspace.onDidChangeConfiguration(configChanged);
    context.subscriptions.push(disposConfig);

    context.subscriptions.push(vscode.commands.registerCommand('extension.linecount.currentfile', countCurrentFile));
    context.subscriptions.push(vscode.commands.registerCommand('extension.linecount.workspace', countWorkspace));
    context.subscriptions.push(vscode.commands.registerCommand('extension.linecount.folder', countFolder));
    context.subscriptions.push(vscode.commands.registerCommand('extension.linecount.showcommands', () => {
        let items = [];
        items.push({ label: 'LineCount: Count current file', detail: 'Count lines for current file.', description: null, command: countCurrentFile });
        items.push({ label: 'LineCount: Count Workspace files', detail: 'Count lines for Workspace files.', description: null, command: countWorkspace });
        vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
            if (selectedItem && typeof selectedItem.command === 'function') {
                selectedItem.command();
            }
        });
    }));

    function configChanged() {
        counter.getConfig();
        if (counter.showStatusBarItem)
            status.show();
        else
            status.hide();
    }
    function countCurrentFile() {
        counter.countCurrentFile();
    }
    function countWorkspace() {
        if (!vscode.workspace.rootPath) {
            vscode.window.showInformationMessage('No open workspace!');
            return;
        }
        counter.countFolder(vscode.workspace.rootPath);
    }
    function countFolder(resource: vscode.Uri) {
        console.log("countFolder " + resource);
        counter.countFolder(resource.fsPath);
    }
    function statusBarText(line: number, comment: number) {
        if (line === 0) {
            status.text = `No LOC`
        } else {
            status.text = `${line} LOC, ${comment} Comment`;
        }
    }
    function onActiveEditorChange() {
        if (!vscode.window.activeTextEditor) {
            return;
        }
        const result = counter.countCurrentFile(true);

        statusBarText(result.code, result.comment);
    }
    configChanged();
}

// this method is called when your extension is deactivated
export function deactivate() {
}