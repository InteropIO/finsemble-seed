//-------------------------------------------------------------------------------------------
// Copyright 2012-2017 by ChartIQ, Inc.
// All rights reserved
//-------------------------------------------------------------------------------------------
(function(_exports) {
	var CIQ=_exports.CIQ, $$=_exports.$$;

	/**
	 * Namespace for Internationalization API.
	 * See {@tutorial Localization} for more details.
	 * @namespace
	 * @name CIQ.I18N
	 */

	CIQ.I18N=function(){};

	// Hack code to make a multi line string easy cut & paste from a spreadsheet
	CIQ.I18N.hereDoc=function(f){
		return f.toString().replace(/^[^/]+\/\*!?/,'').replace(/\*\/[^/]+$/,'');
	};

	/**
	 * Must be set to the desired language. Defaults to english "en"
	 * @memberOf CIQ.I18N
	 * @type {string}
	 */
	CIQ.I18N.language="en";

	/**
	 * Sets the languages that that don't support shortening
	 * Translation will print entire month from locale for these languages
	 * @memberOf CIQ.I18N
	 * @type {Object}
	 */
	CIQ.I18N.longMonths={"zh":true};

	/**
	 * Maintains the list of locales used by {@link CIQ.I18N.localize} to decide if the up/down colors should be reversed and can be updated as outlined on the example.
	 *
	 * Defaults to : {"zh":true,"ja":true};
	 * @type {Object}
	 * @memberOf CIQ.I18N
	 * @since 4.0.0
	 * @example
	 * CIQ.I18N.reverseColorsByLocale={
	 * 		"zh":true,
	 * 		"ja":true,
	 * 		"fr":true,
	 * 		"de":true,
	 * 		"hu":true,
	 * 		"it":true,
	 * 		"pt":true
	 * };
	 */
	CIQ.I18N.reverseColorsByLocale={"zh":true,"ja":true};

	/** Returns a word list containing unique words. Each word references an array of DOM
	 *  nodes that contain that word. This can then be used for translation.
	 *  Text nodes and placeholders which are found in the document tree will be wrapped by this function
	 *  within a <translate> tag for easy translation back and forth.
	 * @param  {HTMLElement} [root] root for the TreeWalker.  If omitted, document.body assumed.
	 * @return {object}      A word list containing unique words.
	 *  @memberOf CIQ.I18N
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
		var line=new RegExp("\n|\t|\f","g");
		var wordList={};
		var dontTranslate={
			"SCRIPT":true,
			"STYLE":true,
			"TEXTAREA":true
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
					if(line.test(key)) key=key.replace(line,''); // strips out new lines in text
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
	 * @return {object} Words that are undefined with values set to empty strings
	 * @memberOf CIQ.I18N
	 * @since 4.0.0 Iterates over the studyLibrary entry name, inputs, & outputs
	 */
	CIQ.I18N.missingWordList=function(language){
		if(!language) language=CIQ.I18N.language;
		var wordsInUI=CIQ.I18N.findAllTextNodes();
		var missingWords={};
		var languageWordList=CIQ.I18N.wordLists[language];
		if(!languageWordList) languageWordList={};

		var addIfMissing = function(x) {
			if (typeof languageWordList[x] == 'undefined') {
				missingWords[x] = '';
			}
		};

		for(var word in wordsInUI){
			addIfMissing(word);
		}

		if (!(CIQ.Studies && CIQ.Studies.studyLibrary)) {
			return missingWords;
		}

		var study;
		var value;

		for (var id in CIQ.Studies.studyLibrary) {
			study = CIQ.Studies.studyLibrary[id];

			addIfMissing(study.name);

			for (var input in study.inputs) {
				addIfMissing(input);
				value = study.inputs[input];

				switch (Object.prototype.toString.call(value)) {
				case '[object String]':
					addIfMissing(value);
					break;
				case '[object Array]':
					for (var i = 0; i < value.length; ++i) {
						addIfMissing(value[i]);
					}
					break;
				}
			}

			for (var output in study.outputs) {
				addIfMissing(output);
			}
		}

		// studyOverZones input fields
		addIfMissing('Show Zones');
		addIfMissing('OverBought');
		addIfMissing('OverSold');

		return missingWords;
	};

	/**
	 * A convenient function for creating a human readable JSON object suitable for delivery to a translator.
	 * @param {string} [language] language. Defaults to CIQ.I18N.language.
	 * @return {string} String of missing words.
	 * @memberOf CIQ.I18N
	 */
	CIQ.I18N.printableMissingWordList=function(language){
		var missingWords=JSON.stringify(CIQ.I18N.missingWordList(language));
		missingWords=missingWords.replace(/","/g, '",\n"');
		return missingWords;
	};

	/**
	 * Passes through the UI (DOM elements) and translates all of the text for the given language.
	 *
	 * It is important to note that if you are dynamically creating UI content and adding it to the DOM after you have set the language,
	 * you must either call this function again after the new content is added,
	 * or ensure your code explicitly translates the new content using {@link CIQ.translatableTextNode} or {@link CIQ.ChartEngine#translateIf}.
	 *
	 * @param {string} [language] language. Defaults to CIQ.I18N.language.
	 * @param {HTMLElement} [root] root for the TreeWalker to prevent the entire page from being translated.  If omitted, document.body assumed.
	 * @memberOf CIQ.I18N
	 * @since 4.0.0 Language code for Portuguese is "pt" (formerly "pu"; maintained for backwards compatibility)
	 */
	CIQ.I18N.translateUI=function(language, root){
		if(language=="pu") language="pt"; // backward compatibility.
		if(!CIQ.I18N.wordLists) return;
		if(!language) language=CIQ.I18N.language;
		var wordsInUI=CIQ.I18N.findAllTextNodes(root);
		var languageWordList=CIQ.I18N.wordLists[language];
		if(!languageWordList) return;

		for(var word in wordsInUI){
			var translation=CIQ.I18N.translateSections(word, languageWordList);
			var nodes=wordsInUI[word];
			for(var i=0;i<nodes.length;i++){
				var node=nodes[i], parentNode=node.parentNode, originalText=parentNode.getAttribute("original");
				// Two scenarios where we don't want to use translation, when undefined or word is not in the translation files
				if(translation===',' || !translation) translation=originalText;
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
	 * @param {string} [language] language. Defaults to CIQ.I18N.language.
	 * @return {string} Translation of the given word, or the word itself if no translation was found.
	 * @memberOf CIQ.I18N
	 */
	CIQ.I18N.translate=function(word, language){
		if(!language) language=CIQ.I18N.language;
		if(!CIQ.I18N.wordLists){
			console.log("Must include translations.js in order to use CIQ.I18N.translate()");
			return word;
		}
		var languageWordList=CIQ.I18N.wordLists[language];
		var translation=null;
		if(languageWordList) translation=(CIQ.I18N.translateSections(word,languageWordList) || word);
		// Lastly check and see if the translation is blank in the CSV source (no translation for given language) which is parsed as ',' and if so fall back to English default
		return translation==="," ? word : translation;
	};

	/**
	 * Translates a phrase which may have untranslatable parts (like a study id).
	 * The translatable pieces are delimited left and right with a non-printable character Zero-Width-Non_Joiner.
	 * @param {string} word The word to translate
	 * @param {object} [languageWordList] Map of words and translations in the desired language
	 * @return {string} Translation of the given phrase
	 * @memberOf CIQ.I18N
	 * @since 4.0.0
	 */
	CIQ.I18N.translateSections=function(word, languageWordList){
		// Test here for word phrases, delimited by the zero-width-non-breaking character
		// we'll split the text into pieces, filtering out the parentheses and commas to generate phrases
		var zwnb="\u200c"; // https://en.wikipedia.org/wiki/Zero-width_non-joiner
		if(typeof(word)=="string" && word.indexOf(zwnb)!=-1){
			word=word.replace(/([(),])/g,zwnb+"$1"+zwnb);
			var sections=word.split(zwnb);
			sections.forEach(function(val, i, arr){
				var padding=val.match(/^(\s*).*\S(\s*)$/);
				var translation=languageWordList[val.trim()];
				if(translation){
					if(padding) translation=padding[1]+translation+padding[2];
					arr[i]=translation;
				}
			});
			return sections.join("");
		}
		return languageWordList[word];
	};

	/**
	 * Converts a 'CSV formatted' string of translations into the required JSON format and set to {@link CIQ.I18N.wordLists}
	 * You can output {@link CIQ.I18N.wordLists} to the console and paste back in if desired.
	 * @param {string} [csv] Translation spreadsheet in csv format **as a single long string**.
	 * Make sure there are no leading tabs, trailing commas or spaces.
	 * Assumes that the header row of the CSV is the language codes and that the first column is the key language (English).
	 * Assumes non-quoted words, data is comma delimited and lines separated by '\n'. Default is CIQ.I18N.csv
	 * @memberOf CIQ.I18N
	 * @example
var csv="en,ar,fr,de,hu,it,pt,ru,es,zh,ja\nChart,الرسم البياني,Graphique,Darstellung,Diagram,Grafico,Gráfico,График,Gráfica,图表,チャート\nChart Style,أسلوب الرسم البياني,Style de graphique,Darstellungsstil,Diagram stílusa,Stile grafico,Estilo do gráfico,Тип графика,Estilo de gráfica,图表类型,チャート形式\nCandle,الشموع,Bougie,Kerze,Gyertya,Candela,Vela,Свеча,Vela,蜡烛,ローソク足\nShape,شكل,Forme,Form,Alak,Forma,Forma,Форма,Forma,形状,パターン";
CIQ.I18N.convertCSV(csv);
	 */
	CIQ.I18N.convertCSV=function(csv){
		var curly=new RegExp("[\u201C\u201D]|[\u2018\u2019]","g");
		var quotation=new RegExp("^(\")|(\")$","g");
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
			var words = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)|(,(?=,))/g) || [];
			var key=words[0];
			if (quotation.test(key)) key=key.replace(quotation,"");
			if (curly.test(key)) key=key.replace(curly,"\"");
			for(var k=1;k<words.length;k++){
				var word=words[k];
				if(quotation.test(word)) word=word.replace(quotation,"");
				wordLists[languages[k]][key]=word;
			}
		}
	};

	/**
	 * Convenience function to set up translation services for a chart and its surrounding GUI.
	 * It automatically sets CIQ.I18N.language, loads all translations and translates the chart.
	 *
	 * Uses/sets (in execution order):
	 *  - {@link CIQ.I18N.convertCSV}
	 *  - {@link CIQ.I18N.language}
	 *  - {@link CIQ.I18N.translateUI}
	 *  - {@link CIQ.I18N.translate}
	 *
	 * Feel free to create your own convenience function if required to explicitly set CIQ.I18N.wordLists instead of using the CIQ.I18N.hereDoc copy-paste spreadsheet in `translations.js`.
	 *
	 * It is important to note that if you are dynamically creating UI content and adding it to the DOM after you have set the language,
	 * you must either call {@link CIQ.I18N.translateUI} after the new content is added,
	 * or ensure your code explicitly translates the new content using {@link CIQ.translatableTextNode} or {@link CIQ.ChartEngine#translateIf}.
	 *
	 * @param {CIQ.ChartEngine} stx A chart object
	 * @param {string} language  A language in your CSV file. For instance 'en' from CIQ.I18N.csv
	 * @param {string} [translationCallback]  Function to perform Canvas Built-in word translations . Default is CIQ.I18N.translate
	 * @param {string} [csv] Translation spreadsheet in csv format **as a single long string**. Make sure no leading tabs, trailing commas or spaces. Default is CIQ.I18N.csv. See {@link CIQ.I18N.convertCSV} for format sample
	 * @param {HTMLElement} [root] root for the TreeWalker to prevent the entire page from being translated.  If omitted, document.body assumed.
	 * @memberOf CIQ.I18N
	 * @since 04-2015
     * <br>&bull; 3.0.0 'root' parameter added.
     * <br>&bull; 4.0.0 Language code for Portuguese is "pt" (formerly "pu"; maintained for backwards compatibility)
	 */
	CIQ.I18N.setLanguage=function(stx, language, translationCallback, csv, root){
		if(language=="pu") language="pt"; // backward compatibility.
		CIQ.I18N.convertCSV(csv);
		CIQ.I18N.language=language;
		CIQ.I18N.translateUI(language, root);
		if (!translationCallback) translationCallback = CIQ.I18N.translate;
		stx.translationCallback=translationCallback;
	};

	/**
	 * This method will set the chart locale using Intl natively or for unsupported browsers dynamically loads the locale using JSONP.
	 * Once the locale is loaded then the chart widget itself is updated for that locale. Use this function when a user can select a locale dynamically so as to avoid
	 * having to include specific locale entries as `script` tags.
	 * The optional callback will be called when the locale has been set.
	 * The Intl library includes JSONP for each locale. A zip of these locales can be requested and should be placed in the locale-data directory of your server.
	 *
	 * Localization formatting is done by {@link CIQ.ChartEngine#setLocale} and can be overwritten as outlined on the example.
	 * @param {CIQ.ChartEngine} stx A chart object
	 * @param {string} locale A valid locale, for instance en-IN
	 * @param {Function} [cb] Callback when locale has been loaded. This function will be passed an error message if it cannot be loaded.
	 * @param {string} [url] url for where to fetch the jsonp data. Defaults to "locale-data/jsonp"
	 * @param {number} [maxDecimals] maximum number of decimal places to allow on number conversions. Defaults to 5. See {@link CIQ.ChartEngine#setLocale} for more details.
	 * @since 3.0.0 maxDecimals was added to the signature
	 * @memberOf CIQ.I18N
	 * @example
	 * CIQ.I18N.setLocale(stxx, "zh");	// set localization services -- before any UI or chart initialization is done
	 * // override time formatting to enable 12 hour clock (hour12:true)
	 * stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:true});
	 * stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:true});

	 */
	CIQ.I18N.setLocale=function(stx, locale, cb, url, maxDecimals){
		if(!Intl.__addLocaleData){	// Intl built into browser
			stx.setLocale(locale,maxDecimals);
			if(cb) cb(null);
			return;
		}
		url=(typeof url=="undefined"?"locale-data/jsonp":url);
		var localeFileURL=url + "/" + locale + ".js";
		var script=document.createElement("SCRIPT");
		script.async = true;
		script.src = localeFileURL;
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(script, s.nextSibling);
		script.onload=function(){
			stx.setLocale(locale,maxDecimals);
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
	 * @param  {CIQ.ChartEngine} stx       Chart object
	 * @param  {object} formatter An Intl compatible date formatter
	 * @param  {string} locale    A valid Intl locale, such as en-IN
	 * @memberOf CIQ.I18N
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

	/**
	 * A convenience function that sets locale and language at once and checks to see if candle colors should be reversed.
 	 * Each of these grouped functions are called with default arguments. If you require custom parameters you will need to call each separately.
 	 *
 	 * {@link CIQ.I18N.reverseColorsByLocale}  is used to determine if the colors should be reversed.
 	 *
 	 * It is important to note that if you are dynamically creating UI content and adding it to the DOM after you have set the language,
	 * you must either call {@link CIQ.I18N.translateUI} after the new content is added,
	 * or ensure your code explicitly translates the new content using {@link CIQ.translatableTextNode} or {@link CIQ.ChartEngine#translateIf}.
 	 *
 	 * Functions are called in the following order:
 	 * - {@link CIQ.I18N.setLocale}
	 * - {@link CIQ.I18N.setLanguage}
	 * - {@link CIQ.I18N.reverseCandles} - Called only if colors need to be reversed.
 	 *
	 * @param {CIQ.ChartEngine} stx Chart object
	 * @param  {string} locale    A valid Intl locale, such as en-IN
	 * @memberOf CIQ.I18N
	 * @since 4.0.0
	 * @example
	 * CIQ.I18N.localize(stxx, "zh");	// set translation and localization services -- before any UI or chart initialization is done
	 * // override time formatting to enable 12 hour clock (hour12:true)
	 * stxx.internationalizer.hourMinute=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", hour12:true});
	 * stxx.internationalizer.hourMinuteSecond=new Intl.DateTimeFormat(this.locale, {hour:"numeric", minute:"numeric", second:"numeric", hour12:true});

	 */
	CIQ.I18N.localize=function(stx, locale){
		var prevLocale=stx.locale; // checks to see if we're switching from a locale with reversed candles
		var reverseLocale=this.reverseColorsByLocale[locale];
		var reversePrevLocale=this.reverseColorsByLocale[prevLocale];
  		this.setLocale(stx, locale);
		this.setLanguage(stx, locale);
		if(reverseLocale && reversePrevLocale) return;
  		if(reverseLocale || reversePrevLocale) this.reverseCandles(stx);
  	};

	/**
	 * Some locales prefer candle colors reversed. This will reverse candle colors without changing CSS.
	 * @param {CIQ.ChartEngine} stx Chart object
	 * @memberOf CIQ.I18N
	 * @since 4.0.0
 	 */
	CIQ.I18N.reverseCandles=function(stx){
		var styles=stx.styles;
		var candleDown=stx.cloneStyle(styles.stx_candle_down);
		var candleUp=stx.cloneStyle(styles.stx_candle_up);
		styles.stx_candle_up=candleDown;
		styles.stx_candle_down=candleUp;
	};



	return _exports;

})/* removeIf(umd) */(typeof window !== 'undefined' ? window : global)/* endRemoveIf(umd) */;
