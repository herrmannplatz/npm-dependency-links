const { languages, Uri, DocumentLink, Range, workspace } = require('vscode');
const path = require('path');

function buildLink(line, lineIndex, package) {
    const startCharacter = line.text.indexOf(package);
    const endCaracter = startCharacter + package.length;
    const linkRange = new Range(lineIndex, startCharacter, lineIndex, endCaracter);
    const registeryUrl = workspace.getConfiguration('npmDependencyLinks').registryUrl;
    const linkUri = Uri.parse(`${registeryUrl}${package}`);
    return new DocumentLink(linkRange, linkUri);
}

exports.activate = function (context) {
    const disposable = languages.registerDocumentLinkProvider(['javascript', { pattern: '**/package.json' }], {
        provideDocumentLinks(document, token) {
            let links = [];
            let lineIndex = 0;
            let shouldCheckForDependency = false;
            
            while (lineIndex < document.lineCount) {
                const line = document.lineAt(lineIndex);

                if (shouldCheckForDependency) {
                    // no need to check for dependencies if block ended
                    if (line.text.includes('}')) {
                        shouldCheckForDependency = false;
                    } else {
                        // find dependecy
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

    context.subscriptions.push(disposable)
};
