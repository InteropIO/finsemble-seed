/* removeIf(umd) */ ;(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['componentUI'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('./componentUI'));
	} else {
		factory(root);
	}
})(this, function(_exports) {
	var CIQ = _exports.CIQ;
	/* endRemoveIf(umd) */

	/**
	 * Language Dialog web component `<cq-language-dialog>`. This creates a dialog that the user can use to change the language.
	 *
	 * The actual language choices are obtained from {@link CIQ.I18N.languages}. Choosing a different language causes the entire
	 * UI to be translated through use of the {@link CIQ.I18N.setLanguage} method.
	 *
	 * @namespace WebComponents.cq-language-dialog
	 * @since
	 * <br>&bull; 4.0.0 New component added added.
	 * <br>&bull; 4.1.0 now it calls {@link CIQ.I18N.localize} instead of {@link CIQ.I18N.setLocale}
	 * @example
	 <cq-dialog>
	 	<cq-language-dialog>
	 	</cq-language-dialog>
	 </cq-dialog>
	 */
	var LanguageDialog = {
		prototype: Object.create(CIQ.UI.DialogContentTag)
	};

	/**
	 * Opens the nearest {@link WebComponents.cq-dialog} to display your dialog.
	 * @alias open
	 * @memberof WebComponents.cq-share-dialog
	 * @since 4.0.0
	 */
	LanguageDialog.prototype.open=function(params){
		CIQ.UI.DialogContentTag.open.apply(this, arguments);
		var cqLanguages=this.node.find("cq-languages");
		cqLanguages.emptyExceptTemplate();
		var template=this.node.find("template");
		var languages=CIQ.I18N.languages;
		if(!languages) return;
		function switchToLanguage(langCode){
			return function(){
				CIQ.UI.contextsForEach(function(){
					var stx=this.stx;
					stx.preferences.language=langCode;
					stx.changeOccurred("preferences");
					CIQ.I18N.localize(stx, langCode);
					stx.draw();
				});
			};
		}
		for(var langCode in languages){
			var node=CIQ.UI.makeFromTemplate(template, cqLanguages);
			node.find("cq-language-name").text(languages[langCode]);
			node.find("cq-flag").attr("cq-lang", langCode);
			node.stxtap(switchToLanguage(langCode));
		}
	};

	/**
	 * Closes dialog box
	 * @alias close
	 * @memberof WebComponents.cq-share-dialog
	 * @since 4.0.0
	 */
	LanguageDialog.prototype.close=function(){
		$("cq-language-dialog").closest("cq-dialog,cq-menu").each(function(){
			this.close();
		});
	};

	CIQ.UI.LanguageDialog=document.registerElement("cq-language-dialog", LanguageDialog);

  /* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
