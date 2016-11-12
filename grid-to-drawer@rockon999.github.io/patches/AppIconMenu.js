/* exported patch, unpatch */

const Lang = imports.lang;

const AppDisplay = imports.ui.appDisplay;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Editor = Me.imports.editor;

const ORIG_redisplay = AppDisplay.AppIconMenu.prototype._redisplay;

function patch() {
    AppDisplay.AppIconMenu.prototype._redisplay = MOD_redisplay;
}

function unpatch() {
    AppDisplay.AppIconMenu.prototype._redisplay = ORIG_redisplay;
}

function MOD_redisplay() {
    ORIG_redisplay.apply(this, arguments);
    let item = this._appendMenuItem('Edit Icon');
    item.connect('activate', Lang.bind(this, function() {
        Editor.edit_app(this._source.app);
    }));
}