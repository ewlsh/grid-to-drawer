/* exported enable, edit_app, get_search_results, disable, setup_ui, get_selecting, get_settings, show_selection_tools, hide_selection_tools, enable_selection, cancel_selection, set_selecting, edit_folder */
/* exported _onButtonPress, _onClicked, _onCreateFolderBtnClick, _onDestroy, _onFolderBtnClick, _onLeaveEvent, _onMenuPoppedDown, _onTouchEvent */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const UI = Me.imports.ui;

const AppDisplay = imports.ui.appDisplay;

const DashPatch = Me.imports.patches.Dash;
const FolderIconPatch = Me.imports.patches.FolderIcon;
const AppIconPatch = Me.imports.patches.AppIcon;
const AppIconMenuPatch = Me.imports.patches.AppIconMenu;
const AllViewPatch = Me.imports.patches.AllView;
const BaseAppViewPatch = Me.imports.patches.BaseAppView;
const AppSearchProviderPatch = Me.imports.patches.AppSearchProvider;


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

    this.selecting = false;
    this.selected_apps = [];
    this._hidden = false;

    UI.setup();
    UI.connect();
}


function disable() {
    cancel_selection();
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

function cancel_selection() {
    if (this.selecting) {
        this.selecting = false;

        for (let icon of UI.get_app_view()._allItems) {
            icon._fc_selected = false;
            icon.actor.remove_style_class_name('selected-app-icon');
        }

        this.selected_apps = [];

        AppDisplay._fc_creating_new_folder = false;

        UI.folder_box.remove_actor(UI._createFolderBtn);
        UI.folder_box.remove_actor(UI._cancelFolderBtn);
        UI.folder_box.add_actor(UI._newFolderBtn);
    }
}

function enable_selection() {
    if (!this.selecting) {
        this.selecting = true;
        this.selected_apps = [];

        AppDisplay._fc_creating_new_folder = true;

        UI.folder_box.remove_actor(UI._newFolderBtn);
        UI.folder_box.add_actor(UI._createFolderBtn);
        UI.folder_box.add_actor(UI._cancelFolderBtn);
    }
}