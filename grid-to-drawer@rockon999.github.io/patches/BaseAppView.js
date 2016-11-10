/* exported patch, unpatch */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;
const UI = Me.imports.ui;

const AppDisplay = imports.ui.appDisplay;

const ORIG_compareItems = AppDisplay.BaseAppView.prototype._compareItems;

function patch() {
    AppDisplay.BaseAppView.prototype._compareItems = MOD_compareItems;
    UI.get_frequent_view()._compareItems = MOD_compareItems;
    UI.get_app_view()._compareItems = MOD_compareItems;
}

function unpatch() {
    AppDisplay.BaseAppView.prototype._compareItems = ORIG_compareItems;
    UI.get_frequent_view()._compareItems = ORIG_compareItems;
    UI.get_app_view()._compareItems = ORIG_compareItems;
}

function MOD_compareItems(a, b) {
    // Call the original.
    let nameA = a.name;
    let nameB = b.name;

    if (Settings.is_customized(a.id) && Settings.has_custom_name(a.id)) {
        nameA = Settings.get_custom_name(a.id);
    }

    if (Settings.is_customized(b.id) && Settings.has_custom_name(b.id)) {
        nameB = Settings.get_custom_name(b.id);
    }


    return nameA.localeCompare(nameB);
}