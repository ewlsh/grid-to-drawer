/* exported SettingsManager, get_customized, has_custom_name, enable_custom_name, get_custom_name, set_custom_name, disable_customization, disable_customization, disable_custom_name has_custom_icon, enable_custom_icon, disable_custom_icon, get_icon_path, set_icon_path, get_folder_settings */

const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Gio = imports.gi.Gio;


function disable_customization(app_id) {
    let settings = SettingsManager.settings;
    let custom_apps = settings.get_strv('custom-apps');
    let index = custom_apps.indexOf(app_id);
    if (index !== -1) {
        custom_apps.splice(index, 1);
        settings.set_strv('custom-apps', custom_apps);

        SettingsManager.refresh_apps();
    }
}

function enable_customization(app_id) {
    let settings = SettingsManager.settings;
    let custom_apps = settings.get_strv('custom-apps');
    if (custom_apps.indexOf(app_id) === -1) {
        custom_apps.push(app_id);
        settings.set_strv('custom-apps', custom_apps);

        SettingsManager.refresh_apps();
    }
}

function is_customized(app_id) {
    let settings = SettingsManager.settings;
    return (settings.get_strv('custom-apps').indexOf(app_id) !== -1);
}

function get_customized() {
    let settings = SettingsManager.settings;
    return settings.get_strv('custom-apps');
}

function has_custom_icon(app_id) {
    if (!is_customized(app_id)) {
        return false;
    }

    let app_settings = SettingsManager.app_settings[app_id];
    return app_settings.get_boolean('enable-custom-icon');
}

function disable_custom_icon(app_id) {
    if (!is_customized(app_id)) {
        return;
    }

    let app_settings = SettingsManager.app_settings[app_id];
    app_settings.set_boolean('enable-custom-icon', false);
}

function enable_custom_icon(app_id) {
    if (!is_customized(app_id)) {
        enable_customization(app_id);
    }

    let app_settings = SettingsManager.app_settings[app_id];
    app_settings.set_boolean('enable-custom-icon', true);
}


function get_icon_path(app_id) {
    if (!is_customized(app_id)) {
        return '';
    }

    let app_settings = SettingsManager.app_settings[app_id];
    return app_settings.get_string('icon-path');
}

function set_icon_path(app_id, path) {
    if (!is_customized(app_id)) {
        return;
    }

    let app_settings = SettingsManager.app_settings[app_id];
    app_settings.set_string('icon-path', path);
}

// NAME FUNCS

function has_custom_name(app_id) {
    if (!is_customized(app_id)) {
        return false;
    }

    let app_settings = SettingsManager.app_settings[app_id];
    return app_settings.get_boolean('enable-custom-name');
}

function disable_custom_name(app_id) {
    if (!is_customized(app_id)) {
        return;
    }

    let app_settings = SettingsManager.app_settings[app_id];
    app_settings.set_boolean('enable-custom-name', false);
}

function enable_custom_name(app_id) {
    if (!is_customized(app_id)) {
        enable_customization(app_id);
    }
    let app_settings = SettingsManager.app_settings[app_id];
    app_settings.set_boolean('enable-custom-name', true);
}


function get_custom_name(app_id) {
    if (!is_customized(app_id)) {
        return '';
    }

    let app_settings = SettingsManager.app_settings[app_id];
    return app_settings.get_string('name');
}

function set_custom_name(app_id, path) {
    if (!is_customized(app_id)) {
        return;
    }

    let app_settings = SettingsManager.app_settings[app_id];
    app_settings.set_string('name', path);
}

function get_folder_settings(name) {
    if (typeof name === 'undefined') {
        return SettingsManager.folder_settings;
    }

    let path = SettingsManager.folder_settings.path + 'folders/' + name + '/';
    return Gio.Settings.new_with_path('org.gnome.desktop.app-folders.folder', path);
}


const _SettingsManager = new Lang.Class({
    Name: 'fc_SettingsManager',
    load: function() {
        this.settings = Convenience.getSettings();

        this.folder_settings = Convenience.getSettings('org.gnome.desktop.app-folders');

        this.app_settings = {};

        let custom_apps = this.settings.get_strv('custom-apps');

        for (let app_id of custom_apps) {
            let custom_path = '/org/gnome/shell/extensions/grid-to-drawer/customApps/' + '' + app_id + '/';
            let obj = Convenience.getSchemaObj('org.gnome.shell.extensions.grid-to-drawer.customApps');
            let app_settings = new Gio.Settings({ path: custom_path, settings_schema: obj });
            this.app_settings[app_id] = app_settings;
        }
    },
    refresh_apps: function() {
        this.app_settings = {};

        let custom_apps = this.settings.get_strv('custom-apps');

        for (let app_id of custom_apps) {
            let custom_path = '/org/gnome/shell/extensions/grid-to-drawer/customApps/' + '' + app_id + '/';
            let obj = Convenience.getSchemaObj('org.gnome.shell.extensions.grid-to-drawer.customApps');
            let app_settings = new Gio.Settings({ path: custom_path, settings_schema: obj });
            this.app_settings[app_id] = app_settings;
        }
    }

});

const SettingsManager = new _SettingsManager();
SettingsManager.load();