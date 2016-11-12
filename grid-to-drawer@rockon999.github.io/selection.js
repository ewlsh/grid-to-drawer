/* exported cancel_selection, enable_selection, get_selection, add_selection, remove_selection, is_active */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const UI = Me.imports.ui;

const AppDisplay = imports.ui.appDisplay;


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

function add_selection(app_id) {
    this.selected_apps.push(app_id);
}

function remove_selection(app_id) {
    this.selected_apps.splice(app_id, 1);
}


function get_selection() {
    return this.selected_apps;
}

function is_active() {
    return this.selecting;
}