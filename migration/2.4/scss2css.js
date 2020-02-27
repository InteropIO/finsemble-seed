const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
chalk.enabled = true;
chalk.level = 1;
const logToTerminal = (msg) => {
	console.log(`[${new Date().toLocaleTimeString()}] ${msg}.`);
}

const scrollbar = path.join(__dirname, "./src-built-in/assets/css/perfect-scrollbar.css");
//Have to monkeypatch the stupid sass importer so scrollbars don't throw it off. It couldn't resolve the file because we were requiring a relative file that was importing a relative file. It just bombed. Our overwrite just hardcodes the path to src-built-in/assets/css/perfect-scrollbar.css
fs.writeFileSync("./node_modules/sass-extract/lib/importer.js", fs.readFileSync("./node-sass-importer-overwrite.js", "utf-8"), "utf-8");

const sassExtract = require("sass-extract");
const glob = require("glob");
const shell = require("shelljs");
const async = require("async");
const beautify = require("beautify");
if (fs.existsSync("./src-built-in/assets/css/perfect-scrollbar.css")) {
	//the dash breaks the sass parsers for some stupid reason.
	shell.mv("./src-built-in/assets/css/perfect-scrollbar.css", "./src-built-in/assets/css/perfectScrollbar.css")
}

function reEscape(s) {
	return s.replace(/([.*+?^$|(){}\[\]])/mg, "\\$1");
}

//Go through all js/jsx files and change the imports from sscss to css
function mapFileReferencesToCSS(finished) {
	glob("src-built-in/**/*.js*", {}, (err, files) => {
		files.forEach((filename) => {
			let fileContents = fs.readFileSync(filename, 'utf-8');
			fileContents = fileContents.replace(/scss/g, "css");
			fileContents = fileContents.replace(/sass/g, "css");
			fileContents = fileContents.replace("_dialogs'", "_dialogs.css'");
			fileContents = fileContents.replace("_formElements'", "_formElements.css'");
			fileContents = fileContents.replace("_globals'", "_globals.css'");
			fileContents = fileContents.replace("_menus'", "_menus.css'");
			fileContents = fileContents.replace("_scrollbars'", "_scrollbars.css'");
			fileContents = fileContents.replace("_toolbar'", "_toolbar.css'");
			fileContents = fileContents.replace("variables'", "variables.css'");
			fileContents = fileContents.replace("_variablesDialogs'", "_variablesDialogs.css'");
			fileContents = fileContents.replace("_variablesMenus'", "_variablesMenus.css'");
			fileContents = fileContents.replace("_variablesToolbar'", "_variablesToolbar.css'");
			fileContents = fileContents.replace("_variablesWindowFrame'", "_variablesWindowFrame.css'");
			fileContents = fileContents.replace("_variablesWindowTitleBar'", "_variablesWindowTitleBar.css'");
			fileContents = fileContents.replace("_windowFrame'", "_windowFrame.css'");
			fileContents = fileContents.replace("_windowTitleBar'", "_windowTitleBar.css'");
			fileContents = fileContents.replace("_fontIcon'", "_fontIcon.css'");

			fs.writeFileSync(filename, fileContents, 'utf-8');
		})
		finished();
	});
}
let vars = {};
function convertSassToCss(finished) {
	glob("src-built-in/**/*.scss", {}, (err, files) => {
		files.forEach(filename => {
			let fileContents = fs.readFileSync(filename, 'utf-8');
			logToTerminal(`Find/replace inside of ${filename}`);

			//Part of this process is generating css files from the scss files. Most of our imports didn't have a file extension. Without the file extension, node-sass bombs out.
			fileContents = fileContents.replace("_colorPalette'", "_colorPalette.scss'");
			fileContents = fileContents.replace("_dialogs'", "_dialogs.scss'");
			fileContents = fileContents.replace("_formElements'", "_formElements.scss'");
			fileContents = fileContents.replace("_globals'", "_globals.scss'");
			fileContents = fileContents.replace("/globals'", "/_globals.scss'");
			fileContents = fileContents.replace("/menus'", "/_menus.scss'");
			fileContents = fileContents.replace("_menus'", "_menus.scss'");
			fileContents = fileContents.replace("_scrollbars'", "_scrollbars.scss'");
			fileContents = fileContents.replace("_toolbar'", "_toolbar.scss'");
			fileContents = fileContents.replace("variables'", "_variables.scss'");
			fileContents = fileContents.replace("_variablesDialogs'", "_variablesDialogs.scss'");
			fileContents = fileContents.replace("_variablesMenus'", "_variablesMenus.scss'");
			fileContents = fileContents.replace("_variablesToolbar'", "_variablesToolbar.scss'");
			fileContents = fileContents.replace("_variablesWindowFrame'", "_variablesWindowFrame.scss'");
			fileContents = fileContents.replace("_variablesWindowTitleBar'", "_variablesWindowTitleBar.scss'");
			fileContents = fileContents.replace("_windowFrame'", "_windowFrame.scss'");
			fileContents = fileContents.replace("_windowTitleBar'", "_windowTitleBar.scss'");
			fileContents = fileContents.replace("_workspaceManagement'", "_workspaceManagement.scss'");
			fileContents = fileContents.replace("_fontIcon'", "_fontIcon.scss'");
			fileContents = fileContents.replace("perfect-scrollbar'", "perfect-scrollbar.css'");
			fileContents = fileContents.replace(/sass/g, "css");
			fileContents = fileContents.replace(new RegExp("\'\.\.\/sass\/", "g"), "'./");

			// fileContents = fileContents.replace(/(\s.*)(http.*)(\;)/g, '$1"$2"');


			//Comment out the import so that sass doesn't replace it with the value of the imported file.
			fileContents = fileContents.replace(/(\@import.*\;)/g, "\/\*\$1\*\/");

			//replace imports with the new css files we'll be generating.
			fileContents = fileContents.replace(/scss/g, "css");


			//This abomination looks for any _value_ that's specified using a variable. It replaces $variableName with var(--variableName), which is CSS-syntax.
			fileContents = fileContents.replace(/(\:)(.*)(\$)(.*)(\;)/g, `: $2 var(--\$4);`);

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
				logToTerminal(`Extracting variables from ${filename}`);

				//Store the rendered CSS and variables on a global object that can be retrieved later.
				if (!vars[filename]) {
					vars[filename] = {
						vars: {},
						css: rendered.css.toString()
					}
				}

				//If the variable was defined inside of this file, store it on the global object.
				for (let varName in rendered.vars.global) {
					let vari = rendered.vars.global[varName];
					// logToTerminal(vari.sources);
					if (vari.sources.some(fname => fname.includes(filename))) {

						vars[filename].vars[varName] = vari;
					}
				}
				done();
			})
				.catch(e => {
					console.error('==========================error', filename, e);
					done();
				});
		}

		//For every file, extract the global variables that were stored.
		async.each(files, extractVars, () => {
			files.forEach(filename => {
				logToTerminal(`Replacing sass-style variables with css-style variables in ${filename}`);
				// logToTerminal(rendered.css.toString());
				let content = vars[filename];
				let variableDefs = content.vars;
				let out = "";
				let css = content.css;

				if (variableDefs) {
					let variableNames = Object.keys(variableDefs);
					if (variableNames.length) {
						//For every variable that was defined in this file, put it under ":root" so that it's available in any css file.
						out = `:root {
							`;
						for (let i = 0; i < variableNames.length; i++) {
							let name = variableNames[i];
							const variableContent = variableDefs[name];
							name = name.replace("$", "");
							let val = processVariable(variableContent);

							//takes $variableName: 1px solid #eee; and replaces it with --variableName: 1px solid #eee;
							out += `--${name}: ${val};
							`;
						}
						out += `}
						`;

						//Regex replaces color: $variableName with var(--variableName)
						//swap out variables for their proper names.
						//My regex was wrong and put --var(--blahblah !important) instead of --var(--blahblah) !important;
						css = css.replace(/(\$)(.*)(\b)/g, `var(--\$2)`);
					}
				} else {
					css = css.replace(/(\$)(.*)(\b)/g, `var(--\$2)`);
				}
				out += css;
				out = out.replace(/(\/\*)(\@import )(.*)(\;)(\*\/)/g, "$2 url($3);");

				//My regex was wrong and put --var(--blahblah !important) instead of --var(--blahblah) !important;
				out = out.replace(/\!important\)/g, ") !important")

				//next two are to handle the roboto import. It's a strange import and rather than handle it elegantly, I do this.
				out = out.replace("url(url(", 'url("');
				out = out.replace("))", '")');

				//Removes the comment on the roboto import.
				out = out.replace('//*@import url("https://fonts.googleapis.com/css?family=Roboto)";*/', '@import url("https://fonts.googleapis.com/css?family=Roboto)"');
				let newFilename = filename.replace("scss", "css");
				fs.writeFileSync(newFilename, beautify(out, { format: "css" }), "utf-8");

				//Uncomment to delete the old sass files.
				shell.rm('-f', filename);
				shell.mv(newFilename, newFilename.replace("/sass/", "/css/"))
			});
			finished();
		});
	});
}

//Given a Sass variable object, it parses and retrieves the value.
function processVariable(variableContent) {

	switch (variableContent.type) {
		case "SassString":

			if (variableContent.value.includes("var(")) {
				val = variableContent.value;
			} else {
				val = `"${variableContent.value}"`
			}
			break;
		case "SassNumber":
			val = variableContent.value + variableContent.unit;
			break;
		case "SassColor":
			val = variableContent.value.hex;
			break;
		case "SassList":
			//Lists are strange objects, but the "expression" is what we want here.
			val = variableContent.declarations[0].expression;

			break;
		case "default":
			console.error("UNEXPECTED TYPE", variableContent.type);
			process.exit();
			break;
	}
	return val;
}

function removeDependencies(finished) {
	let packageJSON = require("./package.json");
	Object.keys(packageJSON.dependencies).forEach(dep => {
		if (dep.includes("sass")) {
			logToTerminal(`Removing dependency ${dep}`);
			delete packageJSON.dependencies[dep];
		}
	});
	Object.keys(packageJSON.devDependencies).forEach(dep => {
		if (dep.includes("sass")) {
			logToTerminal(`Removing devDependency ${dep}`);
			delete packageJSON.devDependencies[dep];
		}
	});
	fs.writeFileSync("./package.json", beautify(JSON.stringify(packageJSON), { format: "json" }), "utf-8");
	finished();
}

function logNotice(finished) {
	logToTerminal(chalk.yellow("NOTE: Go into build/defaultWebpackConfig and manually remove the sass-loader starting on line 53"));
}


async.series([convertSassToCss, mapFileReferencesToCSS, removeDependencies, logNotice])