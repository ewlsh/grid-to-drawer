/* exported add_folder, delete_folder, add_apps, folder_exists */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Extension = Me.imports.extension;

const Gio = imports.gi.Gio;

function add_folder(name) {
    let settings = Extension.get_settings();

    let folder_children = settings.get_strv('folder-children');
    folder_children.push(name);
    settings.set_strv('folder-children', folder_children);

    let path = settings.path + 'folders/' + name + '/';
    let folder = Gio.Settings.new_with_path('org.gnome.desktop.app-folders.folder', path);
    folder.set_string('name', name);
    folder.set_boolean('translate', false);
    folder.set_strv('apps', []);
    folder.set_strv('excluded-apps', []);
    folder.set_strv('categories', []);
}

function delete_folder(name) {
    let settings = Extension.get_settings();

    let path = settings.path + 'folders/' + name + '/';
    let folder = Gio.Settings.new_with_path('org.gnome.desktop.app-folders.folder', path);
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
    let settings = Extension.get_settings();
    let path = settings.path + 'folders/' + name + '/';
    let folder = Gio.Settings.new_with_path('org.gnome.desktop.app-folders.folder', path);
    let folder_apps = folder.get_strv('apps');
    let merged = folder_apps.concat(apps);
    folder.set_strv('apps', merged);
}

function folder_exists(name) {
    let settings = Extension.get_settings();
    let folder_children = settings.get_strv('folder-children');
    return (folder_children.indexOf(name) !== -1);
}