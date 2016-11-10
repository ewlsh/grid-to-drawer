/* exported edit_app, edit_folder */

const Mainloop = imports.mainloop;
const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const EditAppDialog = Me.imports.edit_app_dialog;
const EditDialog = Me.imports.edit_dialog;
const DashPatch = Me.imports.patches.Dash;
const Settings = Me.imports.settings;
const FolderUtil = Me.imports.folder_util;
const Selection = Me.imports.selection;
const UI = Me.imports.ui;

function edit_app(app) {
    let dialog = new EditAppDialog.EditAppDialog(app);

    dialog.connect('closed', Lang.bind(this, function () {
        if (dialog.output !== null) {
            let icon_path = dialog.output['icon_path'];
            let icon_path_enabled = dialog.output['icon_path_enabled'];
            let name = dialog.output['name'];
            let name_enabled = dialog.output['name_enabled'];

            if (typeof icon_path_enabled !== 'undefined') {
                if (icon_path_enabled)
                    Settings.enable_custom_icon(app.id);
                else
                    Settings.disable_custom_icon(app.id);

            }
            if (typeof name_enabled !== 'undefined') {
                if (name_enabled)
                    Settings.enable_custom_name(app.id);
                else
                    Settings.disable_custom_name(app.id);
            }

            if (typeof icon_path !== 'undefined') {
                Settings.set_icon_path(app.id, icon_path);
            }
            if (typeof name !== 'undefined') {
                Settings.set_custom_name(app.id, name);
            }

            Mainloop.idle_add(Lang.bind(this, function () {
                UI.get_app_view()._redisplay();
                UI.get_frequent_view()._redisplay();
                DashPatch.reload_dash_labels();
                return false;
            }));

        }
    }));

    dialog.open();


}


function edit_folder(name) {
    let selected_apps = FolderUtil.folder_exists(name) ? FolderUtil.get_apps(name) : [];
    let dialog = new EditDialog.EditDialog(selected_apps, name);

    dialog.connect('closed', Lang.bind(this, function () {
        let apps = dialog.output;
        if (apps !== null) {
            FolderUtil.remove_folder(name);
            if (apps.length > 0) {
                FolderUtil.create_folder(name);
                FolderUtil.add_apps(name, apps);
            }
        }
        Selection.cancel_selection();
    }));

    dialog.open();
}