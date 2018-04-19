const fs = require("fs");
const path = require("path");
//Have to monkeypatch this stupid sass importer so scrollbars don't throw it off...
const scrollbar = path.join(__dirname, "./src-built-in/components/assets/css/perfect-scrollbar.css");
//@TODO THIS NEEDS TO WORK FOR THE WHOLE THING TO WORK.
fs.writeFileSync("./node_modules/sass-extract/lib/importer.js", fs.readFileSync("./node-sass-importer-overwrite.js", "utf-8"))

const sassExtract = require("sass-extract");
const glob = require("glob");
const shell = require("shelljs");
const async = require("async");
if (fs.existsSync("./src-built-in/assets/css/perfect-scrollbar.css")) {
	//the dash breaks the sass parsers for some stupid reason.
	shell.mv("./src-built-in/assets/css/perfect-scrollbar.css", "./src-built-in/assets/css/perfectScrollbar.css")
}

function reEscape(s) {
	return s.replace(/([.*+?^$|(){}\[\]])/mg, "\\$1");
}

function mapFileReferencesToCSS(finished) {
	glob("src-built-in/**/*.js*", {}, (err, files) => {
		files.forEach((filename) => {
			let fileContents = fs.readFileSync(filename, 'utf-8');
			fileContents = fileContents.replace(/scss/g, "css");
			fs.writeFileSync(filename, fileContents, 'utf-8');
		})
		finished();
	});
}
let vars = {};
function convertSassToCss(finished) {
	glob("src-built-in/**/*.scss", {}, (err, files) => {
		console.log(files)
		files.forEach(filename => {
			// shell.rm('f', filename);
			let fileContents = fs.readFileSync(filename, 'utf-8');
			console.log(filename);
			fileContents = fileContents.replace('@import url(https://fonts.googleapis.com/css?family=Roboto)', '//@import url(https://fonts.googleapis.com/css?family=Roboto)"');
			fileContents = fileContents.replace("_colorPalette'", "_colorPalette.scss'");
			fileContents = fileContents.replace("_dialogs'", "_dialogs.scss'");
			fileContents = fileContents.replace("_formElements'", "_formElements.scss'");
			fileContents = fileContents.replace("_globals'", "_globals.scss'");
			fileContents = fileContents.replace("_menus'", "_menus.scss'");
			fileContents = fileContents.replace("_scrollbars'", "_scrollbars.scss'");
			fileContents = fileContents.replace("_toolbar'", "_toolbar.scss'");
			fileContents = fileContents.replace("variables'", "variables.scss'");
			fileContents = fileContents.replace("_variablesDialogs'", "_variablesDialogs.scss'");
			fileContents = fileContents.replace("_variablesMenus'", "_variablesMenus.scss'");
			fileContents = fileContents.replace("_variablesToolbar'", "_variablesToolbar.scss'");
			fileContents = fileContents.replace("_variablesWindowFrame'", "_variablesWindowFrame.scss'");
			fileContents = fileContents.replace("_variablesWindowTitleBar'", "_variablesWindowTitleBar.scss'");
			fileContents = fileContents.replace("_windowFrame'", "_windowFrame.scss'");
			fileContents = fileContents.replace("_windowTitleBar'", "_windowTitleBar.scss'");
			fileContents = fileContents.replace("_workspaceManagement'", "_workspaceManagement.scss'");
			//Comment out the import.
			fileContents = fileContents.replace(/(\@import.*\;)/g, "\/\*\$1\*\/");
			fileContents = fileContents.replace(/scss/g, "css");


			fileContents = fileContents.replace(/(\:)(.*)(\$)(.*)(\;)/g, `: var(--\$4);`);

			fs.writeFileSync(filename, fileContents, 'utf-8');
		});
		function extractVars(filename, done) {
			sassExtract.render({
				file: filename,
				includePaths: [__dirname],
				importer: function (url, prev, done) {
					// url is the path in import as is, which LibSass encountered.
					// prev is the previously resolved path.
					// done is an optional callback, either consume it or return value synchronously.
					// this.options contains this options hash, this.callback contains the node-style callback
					//sass COULD NOT FIND ps...this just resolves the file manually so it'd shut up.
					if (url.includes('perfect-scrollbar')) {
						return scrollbar;
					}
					return url;
				}
			}).then((rendered) => {
				console.log("Extracting", filename, Object.keys(rendered.vars.global).length);
				if (!vars[filename]) {
					vars[filename] = {
						vars: {},
						css: rendered.css.toString()
					}
				}
				for (let varName in rendered.vars.global) {
					let vari = rendered.vars.global[varName];
					// console.log(vari.sources);
					if (vari.sources.some(fname => fname.includes(filename))) {

						vars[filename].vars[varName] = vari;
					}
				}
				done();
			})
				.catch(e => {
					console.error('==========================errrr', filename, e);
					done();
				});
		}
		async.each(files, extractVars, () => {
			files.forEach(filename => {
				console.log(filename);
				// console.log(rendered.css.toString());
				let content = vars[filename];
				let variableDefs = content.vars;
				let out = "";
				let css = content.css;

				if (variableDefs) {
					let variableNames = Object.keys(variableDefs);
					if (variableNames.length) {
						out = `:root {
							`;
						console.log(variableNames);
						//SassColor, SassList, SassNumber,SassString
						for (let i = 0; i < variableNames.length; i++) {
							let name = variableNames[i];
							const variableContent = variableDefs[name];
							name = name.replace("$", "");
							let val = processVariable(variableContent);
							out += `--${name}: ${val};
							`;
							//swap out variables for their proper names.
						}
						out += `}

						`;
						css = css.replace(/(\$)(.*)(\b)/g, `var(--\$2)`);
						// function onlyUnique(value, index, self) {
						//     return self.indexOf(value) === index;
						// }
						// console.log(variableNames.map(name => variableDefs[name].type).filter(onlyUnique))
					}
				} else {
					css = css.replace(/(\$)(.*)(\b)/g, `var(--\$2)`);
				}
				out += css;
				out = out.replace(/(\/\*)(\@import )(.*)(\;)(\*\/)/g, "$2 url($3);");

				fs.writeFileSync(filename.replace("scss", "css"), out, "utf-8");


			});
			finished();
		});
	});
}

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

async.series(convertSassToCss, mapFileReferencesToCSS)