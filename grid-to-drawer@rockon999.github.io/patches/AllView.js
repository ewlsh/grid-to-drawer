/* exported patch, unpatch */

const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const UI = Me.imports.ui;

const AppDisplay = imports.ui.appDisplay;

const ORIG_loadApps = AppDisplay.AllView.prototype._loadApps;

function patch() {
    AppDisplay.AllView.prototype._loadApps = MOD_loadApps;
    UI.get_app_view()._loadApps = MOD_loadApps;
}

function unpatch() {
    AppDisplay.AllView.prototype._loadApps = ORIG_loadApps;
    UI.get_app_view()._loadApps = ORIG_loadApps;
}

function MOD_loadApps() {
    // Call the original.
    let result = ORIG_loadApps.apply(this, arguments);
    // Modify on demand.
    if (this.constructor === imports.ui.appDisplay.AllView) {
        this._allItems.forEach(Lang.bind(this, function(icon) {
            // Check to make sure the icon is an AppIcon.
            if (typeof (icon.app) !== 'undefined' && icon.app !== null) {
                icon._fc_selectable = true;
                icon._fc_selected = false;
                this.emit('modded-icon-created', icon, icon.app);
            }
        }));
        imports.ui.appDisplay._fc_loaded_mods = true;
    }

    return result;
}
