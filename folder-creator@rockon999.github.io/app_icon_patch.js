/* exported patch */

const Clutter = imports.gi.Clutter;

const AppDisplay = imports.ui.appDisplay;

const ORIG_onClicked = AppDisplay.AppIcon.prototype._onClicked;
const ORIG_onButtonPress = AppDisplay.AppIcon.prototype._onButtonPress;

function patch() {
    AppDisplay.AppIcon.prototype._onClicked = MOD_onClicked;
    AppDisplay.AppIcon.prototype._onButtonPress = MOD_onButtonPress;
}

function MOD_onButtonPress() {
    if (!AppDisplay._fc_creating_new_folder || global.settings.get_uint('app-picker-view') !== imports.ui.appDisplay.Views.ALL) {
        return ORIG_onButtonPress.apply(this, arguments);
    }

    if (this._fc_selectable) {
        return Clutter.EVENT_PROPOGATE;
    }

    return ORIG_onButtonPress.apply(this, arguments);
}

function MOD_onClicked(actor, button) {
    if (!AppDisplay._fc_creating_new_folder || global.settings.get_uint('app-picker-view') !== imports.ui.appDisplay.Views.ALL) {
        return ORIG_onClicked.apply(this, arguments);
    }

    if (this._fc_selectable) {
        if (!this._fc_selected) {
            actor.add_style_class_name('selected-app-icon');
            this._fc_selected = true;
        } else {
            this._fc_selected = false;
            actor.remove_style_class_name('selected-app-icon');
        }
        return Clutter.EVENT_STOP;
    }

    return ORIG_onClicked.apply(this, arguments);

}