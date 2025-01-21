/* eslint-disable indent */
// @ts-nocheck
import { ThemeIcon, window } from 'vscode';
import { workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import LocalConfiguration from '../config';

export default async function selectEnvironment(
    context,
    statusBar,
    getLocalConfig
) {
    let config = await (await getLocalConfig()).config;
    let items = [];

    if (Array.isArray(config)) {
        config.forEach((item) => {
            if (typeof item.name === 'string') {
                items.push({
                    label: item.name,
                    description:
                        typeof item.description === 'string'
                            ? item.description
                            : '',
                    iconPath: item.selected ? new ThemeIcon('check') : null,
                });
            }
        });
    }

    const result = await window.showQuickPick(items, {
        placeHolder: 'Select a Maximo Environment',
        title: 'Select Maximo Environment',
    });

    if (result) {
        statusBar.text = `${result.label}`;
        statusBar.tooltip = `${result.description}`;

        config.forEach((item) => {
            item.selected =
                item.name === result.label || item.host === result.label;
        });

        if (workspace.workspaceFolders !== undefined) {
            let workspaceConfigPath =
                workspace.workspaceFolders[0].uri.fsPath +
                path.sep +
                '.devtools-config.json';
            if (fs.existsSync(workspaceConfigPath)) {
                var secretStorage = context.secrets;
                let localConfig = new LocalConfiguration(
                    workspaceConfigPath,
                    secretStorage
                );
                if (localConfig.configAvailable) {
                    await localConfig.encrypt(config);
                }
            }
        }
    }

    // window.showInformationMessage(`Got: ${result}`);
}
