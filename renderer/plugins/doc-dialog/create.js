/*!
 * Create doc dialog plugin for Editor.md
 *
 * @file        create.js
 * @author      comet
 * @version     1.0.0
 * @updateTime  2025-02-13
 * {@link       https://github.com/cometguo/editor.md}
 * @license     MIT
 */

(function() {

    var factory = function (exports) {

		var pluginName   = "doc-create-dialog";

		exports.fn.docCreateDialog = function(_o,arg) {

            var _this       = this;
            var cm          = this.cm;
            var lang        = this.lang;
            var editor      = this.editor;
            var settings    = this.settings;
            var cursor      = cm.getCursor();
            var selection   = cm.getSelection();
            var objLang     = lang.dialog.create;
            var classPrefix = this.classPrefix;
			var dialogName  = classPrefix + pluginName, dialog;

			cm.focus();

            var loading = function(show) {
                var _loading = dialog.find("." + classPrefix + "dialog-mask");
                _loading[(show) ? "show" : "hide"]();
            };

            if (editor.find("." + dialogName).length < 1)
            {
                var guid   = (new Date).getTime();
                var dialogContent = "<div class=\"" + classPrefix + "form\">"+
                                        "<label>" + objLang.name + "</label>" +
                                        "<input type=\"text\" data-name /><br/>" +
                                        "<label>" + objLang.key + "</label>" +
                                        "<input type=\"text\" data-key /><br/></div>";

                dialog = this.createDialog({
                    title      : objLang.title,
                    width      : 380,
                    height     : 230,
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
                            let name  = this.find("[data-name]").val(),err, key  = this.find("[data-key]").val();
                            if (name === "")
                            {
                                alert(objLang.nameEmpty);
                                return false;
                            }
                            if (key === "" || !/^[a-zA-Z0-9\-]+$/.test(key))
                            {
                                alert(objLang.keyEmpty);
                                return false;
                            }
                            err = ipcRenderer.sendSync('new-back', [key,name]);
                            if(err)
                                alert(err)
                            else
                                this.hide().lockScreen(false).hideMask(),cm.setValue('')
                            return false;
                        }],

                        cancel : [lang.buttons.cancel, function() {
                            this.hide().lockScreen(false).hideMask();

                            return false;
                        }]
                    }
                });

                dialog.attr("id", classPrefix + "doc-create-dialog-" + guid);
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
