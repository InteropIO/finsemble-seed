const sassExtract = require("sass-extract");
const glob = require("glob");
const shell = require("shelljs");
const fs = require("fs");
const async = require("async");
if (fs.existsSync("src-built-in/assets/perfect-scrollbar.css")) {
    //the dash breaks the sass parsers for some stupid reason.
    shell.mv("src-built-in/assets/perfect-scrollbar.css", "src-built-in/assets/perfectScrollbar.css")
}
glob("src/**/*.scss", {}, (err, files) => {
    files.forEach(filename => {
        console.log(filename);
        // shell.rm('f', filename);
        sassExtract.render({
            file: filename
        }).then(rendered => {
            console.log(rendered.vars);
        })
    });
});
let vars = {};
glob("src-built-in/**/*.scss", {}, (err, files) => {
    console.log(files)
    files.forEach(filename => {
        // shell.rm('f', filename);
        let fileContents = fs.readFileSync(filename, 'utf-8');
        console.log(filename);
        fileContents = fileContents.replace('@import url(https://fonts.googleapis.com/css?family=Roboto)', '@import "https://fonts.googleapis.com/css?family=Roboto"');
        fileContents = fileContents.replace("_colorPalette'", "_colorPalette.scss'");
        fileContents = fileContents.replace("_dialogs'", "_dialogs.scss'");
        fileContents = fileContents.replace("_formElements'", "_formElements.scss'");
        fileContents = fileContents.replace("_globals'", "_globals.scss'");
        fileContents = fileContents.replace("_menus'", "_menus.scss'");
        fileContents = fileContents.replace("_scrollbars'", "_scrollbars.scss'");
        fileContents = fileContents.replace("_toolbar'", "_toolbar.scss'");
        fileContents = fileContents.replace("_variables'", "_variables.scss'");
        fileContents = fileContents.replace("_variablesDialogs'", "_variablesDialogs.scss'");
        fileContents = fileContents.replace("_variablesMenus'", "_variablesMenus.scss'");
        fileContents = fileContents.replace("_variablesToolbar'", "_variablesToolbar.scss'");
        fileContents = fileContents.replace("_variablesWindowFrame'", "_variablesWindowFrame.scss'");
        fileContents = fileContents.replace("_variablesWindowTitleBar'", "_variablesWindowTitleBar.scss'");
        fileContents = fileContents.replace("_windowFrame'", "_windowFrame.scss'");
        fileContents = fileContents.replace("_windowTitleBar'", "_windowTitleBar.scss'");
        fileContents = fileContents.replace("_workspaceManagement'", "_workspaceManagement.scss'");
        fileContents = fileContents.replace("perfect-scrollbar'", "perfect\-scrollbar.css'");
        fileContents = fileContents.replace(".scss", ".css");
        //so sass won't actually compile this stuff.

        fs.writeFileSync(filename, fileContents, 'utf-8');
    });

    function extractVars(filename, done) {
        sassExtract.render({
            file: filename,
            includePaths: [__dirname]
        }).then((rendered) => {
            console.log(filename);
            // console.log(rendered.css.toString());
            vars[filename] = rendered.vars.global;
            done();
        })
            .catch(e => {
                console.error('==========================errrr', filename, e);
                done();
            });
    }
    async.each(files, extractVars, () => {
        files.forEach(filename => {
            let fileContents =
            console.log(filename);
            // console.log(rendered.css.toString());
            let variableDefs = vars[filename];
            let out = "";
            let css = fs.readFileSync(filename, 'utf-8');

            if (variableDefs) {
                let variableNames = Object.keys(variableDefs);
                if (variableNames.length) {
                    out = `:root {
                        `;
                    // console.log(variableNames);
                    //SassColor, SassList, SassNumber,SassString
                    for (let i = 0; i < variableNames.length; i++) {
                        let name = variableNames[i];
                        const variableContent = variableDefs[name];
                        name = name.replace("$", "");
                        let val = processVariable(variableContent);
                        console.log(name, val);
                        out += `--${name}: ${val};
                        `;
                        css = css.replace(new RegExp(`$${name}`, "g"), `var(--${name})`);
                    }
                    out += `}

                    `;
                    console.log(out);
                    // function onlyUnique(value, index, self) {
                    //     return self.indexOf(value) === index;
                    // }
                    // console.log(variableNames.map(name => variableDefs[name].type).filter(onlyUnique))
                }
                out += css;
            }
            fs.writeFileSync(filename.replace("scss", "css"), out, "utf-8");


        });
    });



});

function processVariable(variableContent) {
    switch (variableContent.type) {
        case "SassString":
            val = variableContent.value
            break;
        case "SassNumber":
            val = variableContent.value + variableContent.unit;
            break;
        case "SassColor":
            val = variableContent.value.hex;
            break;
        case "SassList":
            val = processVariable(variableContent.value)
            break;
        case "default":
            console.error("UNEXPECTED TYPE", variableContent.type);
            process.exit();
            break;
    }
    return val;
}