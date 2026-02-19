import * as vscode from 'vscode';

function buildLinkFromPattern(line: vscode.TextLine, lineIndex: number, packageName: string) {
    const startCharacter = line.text.indexOf(packageName);
    const endCharacter = startCharacter + packageName.length;
    const linkRange = new vscode.Range(lineIndex, startCharacter, lineIndex, endCharacter);
    const registryUrlPattern = vscode.workspace.getConfiguration('npmDependencyLinks').registryUrlPattern;
    const registryUrl = registryUrlPattern.replace('{{pkg}}', packageName);
    const linkUri = vscode.Uri.parse(registryUrl);
    
    return new vscode.DocumentLink(linkRange, linkUri);
}

function shouldUseUrlPattern() {
    return !!vscode.workspace.getConfiguration('npmDependencyLinks').registryUrlPattern;
}

function buildLink(line: vscode.TextLine, lineIndex: number, packageName: string) {
    if (shouldUseUrlPattern()) {
        return buildLinkFromPattern(line, lineIndex, packageName);
    }

    const startCharacter = line.text.indexOf(packageName);
    const endCharacter = startCharacter + packageName.length;
    const linkRange = new vscode.Range(lineIndex, startCharacter, lineIndex, endCharacter);
    const registryUrl = vscode.workspace.getConfiguration('npmDependencyLinks').registryUrl;
    const linkUri = vscode.Uri.parse(`${registryUrl}${packageName}`);
    return new vscode.DocumentLink(linkRange, linkUri);
}

exports.activate = function (context: vscode.ExtensionContext) {
    const packageJsonProvider = vscode.languages.registerDocumentLinkProvider({ language: 'json', pattern: '**/package.json' }, {
        provideDocumentLinks(document) {
            const links = [];
            let lineIndex = 0;
            let shouldCheckForDependency = false;
            
            while (lineIndex < document.lineCount) {
                const line = document.lineAt(lineIndex);

                if (shouldCheckForDependency) {
                    // no need to check for dependencies if block ended
                    if (line.text.includes('}')) {
                        shouldCheckForDependency = false;
                    } else {
                        // find dependency
                        const matches = line.text.match(/"(.*?)"/);
                        
                        if (matches) {
                            links.push(buildLink(line, lineIndex, matches[1]));
                        }
                    }

                } else {
                    // check if we are in a dependencies block
                    shouldCheckForDependency = /"(.*?)dependencies"/i.test(line.text);
                }
                    
                lineIndex += 1;
            }

            return links;
        }
    });

    const pnpmWorkspaceProvider = vscode.languages.registerDocumentLinkProvider({ language: 'yaml', pattern: '**/pnpm-workspace.yaml' }, {
        provideDocumentLinks(document) {
            const links = [];
            let lineIndex = 0;
            let shouldCheckForCatalogDependencies = false;

            while (lineIndex < document.lineCount) {
                const line = document.lineAt(lineIndex);

                if (/^catalog(s)?:/.test(line.text)){
                    shouldCheckForCatalogDependencies = true;
                } else if (shouldCheckForCatalogDependencies) {
                    if (/^\w+:/.test(line.text)) {
                        shouldCheckForCatalogDependencies = false;
                    } else {
                        const matches = line.text.match(/^\s+"([^"]+)"\s*:\s+.*/) || line.text.match(/^\s+([a-z0-9][\w./-]*):\s+.*/i);

                        if (matches) {
                            links.push(buildLink(line, lineIndex, matches[1]));
                        }
                    }
                }

                lineIndex += 1;
            }

            return links;
        }
    });

    context.subscriptions.push(packageJsonProvider, pnpmWorkspaceProvider);
};
