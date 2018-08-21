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
	 * Themes web component `<cq-themes>`.
	 *
	 * This web component has two functions. The first is displaying available themes in a menu.
	 * The second is providing a theme dialog for entering a new theme.
	 *
	 * Built in themes are merely the names of classes that will be added to the top element of the UIContext when
	 * selected.
	 *
	 * @namespace WebComponents.cq-themes
	 * @example
<cq-themes>
	<cq-themes-builtin cq-no-close>
		<template>
			<cq-item></cq-item>
		</template>
	</cq-themes-builtin>
	<cq-themes-custom cq-no-close>
		<template>
			<cq-theme-custom>
				<cq-item>
					<cq-label></cq-label>
					<cq-close></cq-close>
				</cq-item>
			</cq-theme-custom>
		</template>
	</cq-themes-custom>
	<cq-separator cq-partial></cq-separator>
	<cq-item stxtap="newTheme()"><cq-plus></cq-plus> New Theme </cq-item>
</cq-themes>
	 */
	var Themes = {
		prototype: Object.create(CIQ.UI.ContextTag)
	};

	Themes.prototype.attachedCallback=function(){
		if(this.attached) return;
		CIQ.UI.ContextTag.attachedCallback.apply(this);
		this.attached=true;
		this.builtInMenu=$(this).find("cq-themes-builtin");
		this.builtInTemplate=this.builtInMenu.find("template");
		this.customMenu=$(this).find("cq-themes-custom");
		this.customTemplate=this.customMenu.find("template");
	};

	/**
	 * Initalize the web componenet
	 * @param {Object} params Parameters
	 * @param {Object} [params.builtInThemes] Object map of built in theme names, display names
	 * @param {Object} [params.defaultTheme] The default built in theme to use
	 * @param {Object} [params.nameValueStore] A {@link CIQ.NameValueStore} object for fetching and saving theme state
	 * @param {string} [params.id] id which can be used to disambiguate when multiple charts are on the screen
	 * @memberof WebComponents.cq-themes
	 * @example
	var UIStorage=new CIQ.NameValueStore();

	var UIThemes=$("cq-themes");
	UIThemes[0].initialize({
		builtInThemes: {"ciq-day":"Day","ciq-night":"Night"},
		defaultTheme: "ciq-night",
		nameValueStore: UIStorage
	});
	 */
	Themes.prototype.initialize=function(params){
		this.params={};
		if(params) this.params=params;
		if(!this.params.customThemes) this.params.customThemes={};
		if(!this.params.builtInThemes) this.params.builtInThemes={};
		if(!this.params.nameValueStore) this.params.nameValueStore=new CIQ.NameValueStore();
		if(params.id) this.id="themes_"+params.id;

		var self=this;

		if(this.params.nameValueStore){
			// Retrieve any custom themes the user has created
			this.params.nameValueStore.get("CIQ.Themes.prototype.custom", function(err, result){
				if(!err && result){
					self.params.customThemes=result;
				}
				// Set the current theme to the last one selected by user
				self.params.nameValueStore.get(self.id + "CIQ.Themes.prototype.current", function(err, result){
					if(!err && result && result.theme){
						self.loadTheme(result.theme);
					}else{
						self.loadTheme(self.params.defaultTheme);
					}
					self.configureMenu();
				});
			});
		}else{
			this.loadTheme(self.params.defaultTheme);
		}
	};

	Themes.prototype.configureMenu=function(){
		function loadBuiltIn(self, className){
			return function(e){
				self.loadBuiltIn(className);
				if(self.params.callback){
					self.params.callback({theme:self.currentTheme});
				}
				self.persist("current");
			};
		}
		function loadCustom(self, themeName){
			return function(e){
				self.loadCustom(themeName);
				if(self.params.callback){
					self.params.callback({theme:self.currentTheme});
				}
				self.persist("current");
			};
		}
		this.builtInMenu.emptyExceptTemplate();
		this.customMenu.emptyExceptTemplate();
		var display,newMenuItem;
		var builtInThemes=this.params.builtInThemes;
		for(var className in builtInThemes){
			display=builtInThemes[className];
			newMenuItem=CIQ.UI.makeFromTemplate(this.builtInTemplate);
			newMenuItem.text(display);
			this.makeTap(newMenuItem[0],loadBuiltIn(this, className));
			this.builtInMenu.append(newMenuItem);
		}
		CIQ.I18N.translateUI(null,this.builtInMenu[0]);

		var customThemes=this.params.customThemes;
		for(var themeName in customThemes){
			display=themeName;
			newMenuItem=CIQ.UI.makeFromTemplate(this.customTemplate);
			newMenuItem.find("cq-label").text(display);
			this.makeTap(newMenuItem.find("cq-item")[0],loadCustom(this, themeName));
			newMenuItem[0].close=(function(self, themeName){ return function(){ self.removeTheme(themeName);}; })(this, themeName);
			this.customMenu.append(newMenuItem);
		}
	};

	Themes.prototype.removeTheme=function(themeName){
		var saved=false;
		$("cq-themes").each(function(){
			delete this.params.customThemes[themeName];
			this.configureMenu();
			if(!saved){
				this.persist();
				saved=true;
			}
		});
	};

	Themes.prototype.persist=function(which){
		if(!this.params.nameValueStore) return;
		if(!which || which=="current") this.params.nameValueStore.set(this.id + "CIQ.Themes.prototype.current", {theme:this.currentTheme});
		if(!which || which=="custom") this.params.nameValueStore.set("CIQ.Themes.prototype.custom", this.params.customThemes);
	};

	/**
	 * Adds a custom theme
	 * @memberof WebComponents.cq-themes
	 * @param {object} theme The theme descriptor
	 * @param {Themes} initiatingMenu The menu which initially called ThemeDialog. This is used in order to save the new theme as the current theme.
	 */
	Themes.prototype.addCustom=function(theme, initiatingMenu){
		this.params.customThemes[theme.name]=theme;
		if(initiatingMenu===this) this.currentTheme=theme.name;
		this.configureMenu();
		this.persist();
	};

	/**
	 * @private
	 * @param {object} theme
	 * @memberOf WebComponents.cq-themes
	 */
	Themes.prototype.reinitializeChart=function(theme){
		var stx=this.context.stx;
		stx.styles={};
		stx.chart.container.style.backgroundColor="";
		if(theme){
			var helper=new CIQ.ThemeHelper({stx:stx});
			helper.settings=theme.settings;
			helper.update();
		}
		stx.updateListeners("theme");
		stx.changeOccurred("theme");
		if(stx.displayInitialized){
			stx.headsUpHR();
			stx.clearPixelCache();
			stx.updateListeners("theme");
			stx.draw();
		}
	};

	Themes.prototype.loadTheme=function(themeName){
		if(this.params.customThemes[themeName])
			this.loadCustom(themeName);
		else if(this.params.builtInThemes[themeName])
			this.loadBuiltIn(themeName);
		else
			this.loadBuiltIn(this.params.defaultTheme);
	};


	Themes.prototype.loadBuiltIn=function(className){
		if(this.currentLoadedBuiltIn){
			$(this.context.topNode).removeClass(this.currentLoadedBuiltIn);
		}
		$(this.context.topNode).addClass(className);
		this.currentLoadedBuiltIn=this.currentTheme=className;
		this.reinitializeChart();
	};


	Themes.prototype.loadCustom=function(themeName){
		if(this.currentLoadedBuiltIn){
			$(this.context.topNode).removeClass(this.currentLoadedBuiltIn);
		}
		var theme=this.params.customThemes[themeName];
		if(theme.builtIn) $(this.context.topNode).addClass(theme.builtIn);
		this.currentLoadedBuiltIn=theme.builtIn;
		this.currentTheme=theme.name;
		this.reinitializeChart(theme);
	};

	Themes.prototype.newTheme=function(){
		var self=this;
		$("cq-theme-dialog").each(function(){
			this.open({context: self.context, initiatingMenu: self});
		});
	};

	CIQ.UI.Themes=document.registerElement("cq-themes", Themes);

	/* removeIf(umd) */
	return _exports;
});
/* endRemoveIf(umd) */
