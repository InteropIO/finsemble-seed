const sassExtract = require("sass-extract");
const glob = require("glob");
const shell = require("shelljs");

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

glob("src-built-in/**/*.scss", {}, (err, files) => {
    files.forEach(filename => {
        // shell.rm('f', filename);
        sassExtract.render({
            file: filename
        }).then((rendered) => {
            console.log(filename);
            // console.log(rendered.css.toString());

            let variableDefs = rendered.vars.global;
            let variableNames = Object.keys(variableDefs);
            let out = "";
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
                    `
                }
                out += "}";
                console.log(out);
                // function onlyUnique(value, index, self) {
                //     return self.indexOf(value) === index;
                // }
                // console.log(variableNames.map(name => variableDefs[name].type).filter(onlyUnique))
            }
            out += rendered.css.toString();
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