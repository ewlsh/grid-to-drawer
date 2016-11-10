/* exported init, enable, disable */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Selection = Me.imports.selection;
const UI = Me.imports.ui;

const AppDisplay = imports.ui.appDisplay;

const DashPatch = Me.imports.patches.Dash;
const FolderIconPatch = Me.imports.patches.FolderIcon;
const AppIconPatch = Me.imports.patches.AppIcon;
const AppIconMenuPatch = Me.imports.patches.AppIconMenu;
const AllViewPatch = Me.imports.patches.AllView;
const BaseAppViewPatch = Me.imports.patches.BaseAppView;
const AppSearchProviderPatch = Me.imports.patches.AppSearchProvider;


function init() { }

function enable() {
    AppDisplay._fc_creating_new_folder = false;
    AppDisplay._fc_loaded_mods = false;

    DashPatch.patch();
    FolderIconPatch.patch();
    AppIconPatch.patch();
    AppIconMenuPatch.patch();
    AllViewPatch.patch();
    BaseAppViewPatch.patch();
    AppSearchProviderPatch.patch();

    UI.setup();
    UI.connect();
}


function disable() {
    Selection.cancel_selection();
    UI.hide_selection_tools();

    UI.disconnect();
    UI.cleanup();

    DashPatch.unpatch();
    FolderIconPatch.unpatch();
    AppIconPatch.unpatch();
    AppIconMenuPatch.unpatch();
    AllViewPatch.unpatch();
    BaseAppViewPatch.unpatch();
    AppSearchProviderPatch.unpatch();

    delete AppDisplay._fc_creating_new_folder;
    delete AppDisplay._fc_loaded_mods;
}

