/* exported create_folder, remove_folder, add_apps, get_for_app, folder_exists, get_folder_for_app */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

function create_folder(name) {
    let settings = Settings.get_folder_settings();

    let folder_children = settings.get_strv('folder-children');
    folder_children.push(name);

    settings.set_strv('folder-children', folder_children);

    let folder = Settings.get_folder_settings(name);
    folder.set_string('name', name);
    folder.set_boolean('translate', false);
    folder.set_strv('apps', []);
    folder.set_strv('excluded-apps', []);
    folder.set_strv('categories', []);
}

function remove_folder(name) {
    let settings = Settings.get_folder_settings();

    let folder = Settings.get_folder_settings(name);
    folder.set_strv('apps', null);
    folder.set_strv('categories', null);
    folder.set_strv('excluded-apps', null);
    folder.set_string('name', '');
    folder.set_boolean('translate', false);

    let folder_children = settings.get_strv('folder-children');
    let index = folder_children.indexOf(name);
    folder_children.splice(index, 1);
    settings.set_strv('folder-children', folder_children);
}

function add_apps(name, apps) {
    let folder = Settings.get_folder_settings(name);
    let folder_apps = folder.get_strv('apps');
    let merged = folder_apps.concat(apps);
    folder.set_strv('apps', merged);
}

function get_apps(name) {
    let folder = Settings.get_folder_settings(name);
    let folder_apps = folder.get_strv('apps');
    return folder_apps;
}


function get_folder_for_app(app_id) {
    let settings = Settings.get_folder_settings();

    let folder_children = settings.get_strv('folder-children');
    for (let folder_id of folder_children) {
        let apps = get_apps(folder_id);
        if (apps.indexOf(app_id) !== -1) {
            return folder_id;
        }
    }
    return null;
}

function folder_exists(name) {
    let settings = Settings.get_folder_settings();
    let folder_children = settings.get_strv('folder-children');
    return (folder_children.indexOf(name) !== -1);
}