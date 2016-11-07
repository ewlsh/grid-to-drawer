/* exported patch, unpatch */

const Lang = imports.lang;

const AppDisplay = imports.ui.appDisplay;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const AppUtil = Me.imports.app_util;

const ORIG_redisplay = AppDisplay.AppIconMenu.prototype._redisplay;

function patch() {
    AppDisplay.AppIconMenu.prototype._redisplay = MOD_redisplay;
}

function unpatch() {
    AppDisplay.AppIconMenu.prototype._redisplay = ORIG_redisplay;
}

function MOD_redisplay() {
    ORIG_redisplay.apply(this, arguments);
    let item = this._appendMenuItem('Edit');
    item.connect('activate', Lang.bind(this, function () {
        AppUtil.edit_app(this._source.app);
    }));
}