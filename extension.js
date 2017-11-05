const { languages, Uri, DocumentLink, Range } = require('vscode');
const path = require('path');

exports.activate = function (context) {
    const disposable = languages.registerDocumentLinkProvider(['javascript', { language: 'json', pattern: '**/package.json' }], {
        provideDocumentLinks(document, token) {
            const { fileName } = document;

            // Check why pattern is not working
            if (path.basename(fileName) !== 'package.json') {
                return;
            }

            const pkg = JSON.parse(document.getText());
            const { dependencies = {}, devDependencies = {}, optionalDependencies = {}} = pkg;

            const links = [];
            let lineIndex = 0;

            function extractLink(line, package, version) {
                if (line.text.match(package, version)) {
                    const startCharacter = line.text.indexOf(package);
                    const endCaracter = startCharacter + package.length;
                    const linkRange = new Range(lineIndex, startCharacter, lineIndex, endCaracter);
                    const linkUri = Uri.parse(`https://www.npmjs.com/package/${package}`);
                    links.push(new DocumentLink(linkRange, linkUri));
                }
            }
            
            while (lineIndex < document.lineCount) {
                const line = document.lineAt(lineIndex);

                [
                    ...Object.entries(dependencies),
                    ...Object.entries(devDependencies),
                    ...Object.entries(optionalDependencies)
                ].forEach(([package, version]) => {
                    extractLink(line, package, version);
                });
                    
                lineIndex += 1;
            }

            return links;
        }
    });

    context.subscriptions.push(disposable)
};

exports.deactivate = function () {
};