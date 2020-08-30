const { languages, Uri, DocumentLink, Range, workspace } = require('vscode');

function buildLinkFromPattern(line, lineIndex, packageName) {
    const startCharacter = line.text.indexOf(packageName);
    const endCharacter = startCharacter + packageName.length;
    const linkRange = new Range(lineIndex, startCharacter, lineIndex, endCharacter);
    const registryUrlPattern = workspace.getConfiguration('npmDependencyLinks').registryUrlPattern;
    const registryUrl = registryUrlPattern.replace('{{pkg}}', packageName)
    const linkUri = Uri.parse(registryUrl);
    
    return new DocumentLink(linkRange, linkUri);
}

function shouldUseUrlPattern() {
    return !!workspace.getConfiguration('npmDependencyLinks').registryUrlPattern
}

function buildLink(line, lineIndex, packageName) {
    if (shouldUseUrlPattern()) {
        return buildLinkFromPattern(line, lineIndex, packageName)
    }

    const startCharacter = line.text.indexOf(packageName);
    const endCharacter = startCharacter + packageName.length;
    const linkRange = new Range(lineIndex, startCharacter, lineIndex, endCharacter);
    const registryUrl = workspace.getConfiguration('npmDependencyLinks').registryUrl;
    const linkUri = Uri.parse(`${registryUrl}${packageName}`);
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

    context.subscriptions.push(disposable)
};
