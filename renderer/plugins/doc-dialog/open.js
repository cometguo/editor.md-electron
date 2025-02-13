/*!
 * Open doc dialog plugin for Editor.md
 *
 * @file        open.js
 * @author      comet
 * @version     1.0.0
 * @updateTime  2025-02-13
 * {@link       https://github.com/cometguo/editor.md}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "doc-open-dialog";

		exports.fn.docOpenDialog = function(_o,arg) {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var objLang     = lang.dialog.open;
            var classPrefix = this.classPrefix;
			var dialogName  = classPrefix + pluginName, dialog;

			cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime(),ops='';

                if(typeof arg=='object' && arg.docs)
                    arg.docs.map(i=>{
                        ops+=`<option value="${i.key}">${i.name}</option>`;
                    })

                var dialogContent = "<div class=\"" + classPrefix + "form\">"+
                                        "<label>" + objLang.key + "</label>" +
                                        '<select data-key style="width: 264px;padding: 8px;">'+ops+"</select><br/></div>";

                dialog = this.createDialog({
                    title      : objLang.title,
                    width      : 380,
                    height     : 165,
                    name       : dialogName,
                    content    : dialogContent,
                    mask       : settings.dialogShowMask,
                    drag       : settings.dialogDraggable,
                    lockScreen : settings.dialogLockScreen,
                    maskStyle  : {
                        opacity         : settings.dialogMaskOpacity,
                        backgroundColor : settings.dialogMaskBgColor
                    },
                    buttons : {
                        enter : [lang.buttons.enter, function() {
                            this.hide().lockScreen(false).hideMask();
                            let key  = this.find("[data-key]").val(),name=this.find("[data-key]").find('option:selected').text(),txt=ipcRenderer.sendSync('open-back', [key,name]);
                            txt=='===='||cm.setValue(txt)
                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "doc-open-dialog-" + guid);
            }

			dialog = editor.find("." + dialogName);
			dialog.find("[type=\"text\"]").val("");

			this.dialogShowMask(dialog);
			this.dialogLockScreen();
			dialog.show();

		};

	};

	// CommonJS/Node.js
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object")
    {
        module.exports = factory;
    }
	else if (typeof define === "function")  // AMD/CMD/Sea.js
    {
		if (define.amd) { // for Require.js

			define(["editormd"], function(editormd) {
                factory(editormd);
            });

		} else { // for Sea.js
			define(function(require) {
                var editormd = require("./../../editormd");
                factory(editormd);
            });
		}
	}
	else
	{
        factory(window.editormd);
	}

})();
