// -------------------------------------------------------------------------------------------
// Copyright 2012-2016 by ChartIQ, Inc
// -------------------------------------------------------------------------------------------
(function (definition) {
    "use strict";

    if (typeof exports === "object" && typeof module === "object") {
        module.exports = definition(require('./core/master'));
    } else if (typeof define === "function" && define.amd) {
        define(['core/master'], definition);
    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
		var global = typeof window !== "undefined" ? window : self;
		definition(global);
    } else {
		throw new Error("Only CommonJS, RequireJS, and <script> tags supported for i18n.js.");
    }

})(function(_exports) {
	console.log("il8n.js",_exports);

	var CIQ=_exports.CIQ;

	/**
	 * Namespace for Internationalization API
	 * @namespace
	 * @name CIQ.I18N
	 */

	CIQ.I18N=function(){};

	// Hack code to make a multi line string easy cut & paste from a spreadsheet
	CIQ.I18N.hereDoc=function(f){
		return f.toString().replace(/^[^\/]+\/\*!?/,'').replace(/\*\/[^\/]+$/,'');
	};

	/**
	 * Must be set to the desired lanuage. Defaults to english "en"
	 * @memberOf  CIQ.I18N
	 * @type {string}
	 */
	CIQ.I18N.language="en";

	/**
	 * Sets the languages that that don't support shortening
	 * Translation will print entire month from locale for these languages
	 * @memberOf  CIQ.I18N
	 * @type {Object}
	 */
	CIQ.I18N.longMonths={"zh":true,"ja":true};

	/** Returns a word list containing unique words. Each word references an array of DOM
	 *  nodes that contain that word. This can then be used for translation.
	 *  Text nodes and placeholders which are found in the document tree will be wrapped by this function
	 *  within a <translate> tag for easy translation back and forth.
	 * @param  {HTMLElement} [root] Optional root for the TreeWalker.  If omitted, document.body assumed.
	 * @return {object}      A word list containing unique words.
	 *  @memberOf  CIQ.I18N
	 */
	CIQ.I18N.findAllTextNodes=function(root){
		if(!root) root=document.body;
		// Get all the words from the placeholders
		// We'll create text nodes for them and stash them in a hidden div so we can access them in the future
		if(root==document.body){
			if(!$$("stashedTextNodes")){
				var stashedTextNodes=document.createElement("div");
				stashedTextNodes.id="stashedTextNodes";
				stashedTextNodes.style.display="none";
				root.appendChild(stashedTextNodes);

				var fields=document.querySelectorAll("input,textarea,.editable_content");
				for(var f=0;f<fields.length;f++){
					var placeHolder=fields[f].getAttribute("placeholder");
					if(placeHolder){
						var wrapper=stashedTextNodes.appendChild(document.createElement("translate"));
						wrapper.setAttribute("original",placeHolder);
						wrapper.placeholderFor=fields[f];
						wrapper.appendChild(document.createTextNode(placeHolder));
					}
				}
			}
		}

		var walker = document.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		var node = walker.nextNode();
		var ws=new RegExp("^\\s*$");
		var wordList={};
		var dontTranslate={
			"SCRIPT":true,
			"STYLE":true
		};

		while(node) {
			var key=node.nodeValue;
			if(!ws.test(key)){
				var parentNode=node.parentNode;
				var parentTag=parentNode.tagName;
				if(!dontTranslate[parentTag]){
					if(parentTag!="TRANSLATE"){
						var wrapper2=parentNode.insertBefore(document.createElement("translate"),node);
						wrapper2.setAttribute("original",key);  //must do getAttribute so it will clone
						wrapper2.appendChild(node);
					}else{
						key=parentNode.getAttribute("original");
					}
					if(!wordList[key]) wordList[key]=[];
					wordList[key].push(node);
				}
			}
			node = walker.nextNode();
		}
		if(root==document.body){
			// For missing word list collation only:
			// Get all the words from the study library that are used to populate the study dialogs.
			// These will have an empty array since they aren't associated with any nodes
			var studyLibrary=CIQ.Studies?CIQ.Studies.studyLibrary:null;
			if(studyLibrary){
				for(var study in studyLibrary){
					if(wordList[study]===null) wordList[study]=[];
					var s=studyLibrary[study];
					if(s.inputs){
						for(var input in s.inputs){
							if(!wordList[input]) wordList[input]=[];
						}
					}
					if(s.outputs){
						for(var output in s.outputs){
							if(!wordList[output]) wordList[output]=[];
						}
					}
				}
			}
		}
		return wordList;
	};

	/**
	 * CIQ.I18N.missingWordList will scan the UI by walking all the text elements. It will determine which
	 * text elements have not been translated for the given language and return those as a JSON object.
	 * @param {string} [language] The language to search for missing words. Defaults to whatever language CIQ.I18N.language has set.
	 * @memberOf  CIQ.I18N
	 */
	CIQ.I18N.missingWordList=function(language){
		if(!language) language=CIQ.I18N.language;
		var wordsInUI=CIQ.I18N.findAllTextNodes();
		var missingWords={};
		var languageWordList=CIQ.I18N.wordLists[language];
		if(!languageWordList) languageWordList={};
		for(var word in wordsInUI){
			if(typeof languageWordList[word]=="undefined"){
				missingWords[word]="";
			}
		}
		return missingWords;
	};

	/**
	 * A convenient function for creating a human readable JSON object suitable for delivery to a translator.
	 * @param {string} [language] Optional language. Defaults to CIQ.I18N.language.
	 * @memberOf  CIQ.I18N
	 */
	CIQ.I18N.printableMissingWordList=function(language){
		var missingWords=JSON.stringify(CIQ.I18N.missingWordList(language));
		missingWords=missingWords.replace(/\",\"/g, '",\n"');
		return missingWords;
	};

	/**
	 * Passes through the UI (DOM elements) and translates all of the text for the given language.
	 * @param {string} [language] Optional language. Defaults to CIQ.I18N.language.
	 * @param  {HTMLElement} [root] Optional root for the TreeWalker.  If omitted, document.body assumed.
	 * @memberOf  CIQ.I18N
	 */
	CIQ.I18N.translateUI=function(language, root){
		if(!CIQ.I18N.wordLists) return;
		if(!language) language=CIQ.I18N.language;
		var wordsInUI=CIQ.I18N.findAllTextNodes(root);
		var languageWordList=CIQ.I18N.wordLists[language];
		if(!languageWordList) return;

		for(var word in wordsInUI){
			var translation=languageWordList[word];
			var nodes=wordsInUI[word];
			for(var i=0;i<nodes.length;i++){
				var node=nodes[i], parentNode=node.parentNode, originalText=parentNode.getAttribute("original");
				if(!translation) translation=originalText;
				var elemWithPlaceholder=parentNode.placeholderFor;
				if(elemWithPlaceholder){
					elemWithPlaceholder.placeholder=translation;
				}else{
					node.data=translation;
				}
			}
		}
	};

	/**
	 * Translates an individual word for a given language. Set stxx.translationCallback to this function
	 * in order to automatically translate all textual elements on the chart itself.
	 * @param {string} word The word to translate
	 * @param {string} [language] Optional language. Defaults to CIQ.I18N.language.
	 * @memberOf  CIQ.I18N
	 */
	CIQ.I18N.translate=function(word, language){
		if(!language) language=CIQ.I18N.language;
		if(!CIQ.I18N.wordLists){
			console.log("Must include translations.js in order to use CIQ.I18N.translate()");
			return word;
		}
		var languageWordList=CIQ.I18N.wordLists[language];
		var translation=null;
		if(languageWordList) translation=languageWordList[word];
		return translation ? translation : word;
	};

	/**
	 * Converts a CSV array of translations into the required JSON format. You can output this to the console and paste back in if desired.
	 * Assumes that the header row of the CSV is the language codes and that the first column is the key language (English). Assumes non-quoted words.
	 * @param {array} [csv] Optional Translation spreadsheet in csv format. Make sure no leading tabs, trailing commas or spaces. Default is CIQ.I18N.csv
	 * @memberOf CIQ.I18N
	 */
	CIQ.I18N.convertCSV=function(csv){
		var wordLists=CIQ.I18N.wordLists;
		if(!csv) csv=CIQ.I18N.csv;
		var lines=csv.split("\n");
		var headerRow=lines[0];
		var languages=headerRow.split(",");
		for(var j=0;j<languages.length;j++){
			var lang=languages[j];
			if(!wordLists[lang]){
				wordLists[lang]={};
			}
		}
		for(var i=1;i<lines.length;i++){
			var words=lines[i].split(",");
			var key=words[0];
			for(var k=1;k<words.length;k++){
				wordLists[languages[k]][key]=words[k];
			}
		}
	};

	/**
	 * Convenience function to set up translation services for a chart and its surrounding GUI.
	 * It automatically sets CIQ.I18N.language, loads all translations and translates the chart.
	 * @param {object} stx A chart object
	 * @param {string} language  For instance 'en'
	 * @param {string} [translationCallback]  Function to perform Canvas Built-in word translations . Default is CIQ.I18N.translate
	 * @param {array} [csv] Translation spreadsheet in csv format. Make sure no leading tabs, trailing commas or spaces. Default is CIQ.I18N.csv
	 * @memberOf CIQ.I18N
	 * @since 04-2015
	 */
	CIQ.I18N.setLanguage=function(stx, language, translationCallback, csv){
		 CIQ.I18N.convertCSV(csv);
		 CIQ.I18N.language=language;
		 CIQ.I18N.translateUI();
		 if (!translationCallback) translationCallback = CIQ.I18N.translate;
		 stx.translationCallback=translationCallback;
	};

	/**
	 * This method will set the chart locale using Intl natively or for unsupported browsers dynamically loads the locale using JSONP.
	 * Once the locale is loaded then the chart widget itself is updated for that locale. Use this function when a user can select a locale dynamically so as to avoid
	 * having to include specific locale entries as `script` tags. The optional callback will be called when the locale
	 * has been set. The Intl library includes JSONP for each locale. A zip of these locales can be requested and should
	 * be placed in the locale-data directory of your server.
	 * @param {object} stx A chart object
	 * @param {string} locale A valid locale, for instance en-IN
	 * @param {Function} [cb] Callback when locale has been loaded. This function will be passed an error message if it cannot be loaded.
	 * @memberOf  CIQ.I18N
	 */
	CIQ.I18N.setLocale=function(stx, locale, cb){
		if(!Intl.__addLocaleData){	// Intl built into browser
			stx.setLocale(locale);
			if(cb) cb(null);
			return;
		}
		var localeFileURL="locale-data/jsonp/" + locale + ".js";
		var script=document.createElement("SCRIPT");
		script.async = true;
		script.src = localeFileURL;
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(script, s.nextSibling);
		script.onload=function(){
			stx.setLocale(locale);
			if(cb) cb(null);
		};
		script.onerror=function(){
			if(cb) cb("cannot load script");
		};
	};
	
	/**
	 * Extract the name of the month from the locale. We do this by creating a
	 * localized date for the first date of each month. Then we extract the alphabetic characters.
	 * MonthLetters then becomes the first letter of the month. Note that in the current Intl.js locale, chinese and
	 * japanese months are implemented as 1月 through 12月 which causes this algorithm to fail. Hopefully real months
	 * will be available when Intl becomes a browser standard, otherwise this method or the locale will need to
	 * be modified for those or other special cases. The arrays are stored in stx.monthAbv and stx.monthLetters which
	 * will then override the global arrays CIQ.monthAbv and CIQ.monthLetters.
	 * @param  {object} stx       Chart object
	 * @param  {object} formatter An Intl compatible date formatter
	 * @param  {string} locale    A valid Intl locale, such as en-IN
	 * @memberOf  CIQ.I18N
	 */
	CIQ.I18N.createMonthArrays=function(stx, formatter, locale){
		stx.monthAbv=[];
		stx.monthLetters=[];
		var dt=new Date();
		var shortenMonth=true;
		if(CIQ.I18N.longMonths && CIQ.I18N.longMonths[locale]) shortenMonth=false;
		for(var i=0;i<12;i++){
			dt.setDate(1);
			dt.setMonth(i);
			var str=formatter.format(dt);
			if(shortenMonth){
				var month="";
				for(var j=0;j<str.length;j++){
					var c=str.charAt(j);
					var cc=c.charCodeAt(0);
					if(cc<65) continue;
					month+=c;
				}
				stx.monthAbv[i]=month;
				stx.monthLetters[i]=month[0];
			}else{
				stx.monthAbv[i]=str;
				stx.monthLetters[i]=str;
			}
		}
	};

	
	
	
	return _exports;

});
