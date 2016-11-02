/* exported enable, disable, setup_ui, get_selecting, get_settings, show_selection_tools, hide_selection_tools, enable_selection, cancel_selection, set_selecting, edit_folder */
/* exported _onButtonPress, _onClicked, _onCreateFolderBtnClick, _onDestroy, _onFolderBtnClick, _onLeaveEvent, _onMenuPoppedDown, _onTouchEvent */

const Mainloop = imports.mainloop;
const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const FolderIconPatch = Me.imports.folder_icon_patch;
const AppIconPatch = Me.imports.app_icon_patch;
const AppDisplayPatch = Me.imports.app_display_patch;
const FolderDialog = Me.imports.folder_dialog;
const EditDialog = Me.imports.edit_dialog;
const Convenience = Me.imports.convenience;
const Util = Me.imports.util;

const AppDisplay = imports.ui.appDisplay;
const ViewSelector = imports.ui.viewSelector;

const Main = imports.ui.main;



function enable() {
    this.settings = Convenience.getSettings('org.gnome.desktop.app-folders');

    inject_variables();

    FolderIconPatch.patch();
    AppIconPatch.patch();
    AppDisplayPatch.patch();

    buildUI();

    this.selecting = false;
    this.selected_apps = [];
    this._hidden = false;

    get_app_view().connect('modded-icon-created', Lang.bind(this, function (n, icon) {
        const app_ = icon.app;

        icon.actor.connect('clicked', Lang.bind(this, function (actor, button) {
            if (this.selected_apps.indexOf(app_.id) === -1) {
                this.selected_apps.push(app_.id);
            } else {
                this.selected_apps.splice(this.selected_apps.indexOf(app_.id), 1);
            }

        }));
    }));

    Mainloop.idle_add(Lang.bind(this, function () {
        get_app_view()._redisplay();
    }));
}


function disable() {
    cancel_selection();
    hide_selection_tools();
}


function inject_variables() {
    AppDisplay._fc_creating_new_folder = false;
    AppDisplay._fc_loaded_mods = false;
}

function buildUI() {
    this.folder_box = new St.Widget({
        layout_manager: new Clutter.BoxLayout({ spacing: 20 }),
        x_expand: true,
        y_expand: false,
        x_align: Clutter.ActorAlign.END,
        y_align: Clutter.ActorAlign.CENTER
    });

    this._newFolderBtn = new St.Button({
        can_focus: true
    });
    this._newFolderBtn.child = new St.Icon({ icon_name: 'folder-new', icon_size: 32 });

    this._createFolderBtn = new St.Button({
        can_focus: true

    });

    this._createFolderBtn.child = new St.Icon({ icon_name: 'object-select-symbolic', fallback_icon_name: 'dialog-yes', icon_size: 32 });

    this._cancelFolderBtn = new St.Button({
        can_focus: true
    });

    this._cancelFolderBtn.child = new St.Icon({ icon_name: 'dialog-cancel', icon_size: 20 });

    this._newFolderBtn.connect('clicked', Lang.bind(this, this._onFolderBtnClick));
    this._cancelFolderBtn.connect('clicked', Lang.bind(this, this._onFolderBtnClick));
    this._createFolderBtn.connect('clicked', Lang.bind(this, this._onCreateFolderBtnClick));


    this.folder_box.add_style_class_name('folder-box');

    this.folder_box.add_actor(this._newFolderBtn);

    //Main.overview._overview.add_actor(this.folder_box);
    Main.overview.viewSelector.appDisplay.actor.add_actor(this.folder_box);

    Main.overview.connect('hiding', Lang.bind(this, function () {
        this.cancel_selection();
    }));
    /* new St.Bin({
            style: 'margin-bottom: 20px; margin-right: 20px;',
            child: this.folder_box,

        })*/
    Main.overview.connect('showing', Lang.bind(this, function () {
        if (!AppDisplay._fc_loaded_mods) {
            log('Modded App Icons Loaded.');
            get_app_view()._redisplay();
        }
    }));

    Main.overview.viewSelector.connect('page-changed', Lang.bind(this, function () {
        if (Main.overview.viewSelector.getActivePage() === ViewSelector.ViewPage.APPS) {
            if (global.settings.get_uint('app-picker-view') === AppDisplay.Views.ALL) {
                show_selection_tools();
            } else {
                hide_selection_tools();
            }
        } else {
            hide_selection_tools();
            cancel_selection();
        }

    }));

    global.settings.connect('changed::app-picker-view', Lang.bind(this, function () {
        if (global.settings.get_uint('app-picker-view') === AppDisplay.Views.ALL) {
            show_selection_tools();
        } else {
            hide_selection_tools();
        }
    }));
}

function show_selection_tools() {
    this.folder_box.set_opacity(255);
    this._hidden = false;
}

function hide_selection_tools() {
    this.folder_box.set_opacity(0);
    this._hidden = true;
}

function get_app_view() {
    return Main.overview.viewSelector.appDisplay._views[AppDisplay.Views.ALL].view;
}

function cancel_selection() {
    if (this.selecting) {
        this.selecting = false;

        for (let icon of get_app_view()._allItems) {
            icon._fc_selected = false;
            icon.actor.remove_style_class_name('selected-app-icon');
        }

        this.selected_apps = [];

        AppDisplay._fc_creating_new_folder = false;

        this.folder_box.remove_actor(this._createFolderBtn);
        this.folder_box.remove_actor(this._cancelFolderBtn);
        this.folder_box.add_actor(this._newFolderBtn);
    }
}

function enable_selection() {
    if (!this.selecting) {
        this.selecting = true;
        this.selected_apps = [];

        AppDisplay._fc_creating_new_folder = true;

        this.folder_box.remove_actor(this._newFolderBtn);
        this.folder_box.add_actor(this._createFolderBtn);
        this.folder_box.add_actor(this._cancelFolderBtn);
    }
}

// TODO: Figure out the best way to do this.
function edit_folder(_source, id) {
    let selected_apps = Util.folder_exists(id) ? Util.get_apps(id) : [];
    let dialog = new EditDialog.EditDialog(selected_apps, id);

    dialog.connect('closed', Lang.bind(this, function () {
        let apps = dialog.output;
        if (apps !== null) {
            Util.delete_folder(id);
            if (apps.length > 0) {
                Util.add_folder(id);
                Util.add_apps(id, apps);
            }
        }
        this.cancel_selection();

    }));

    dialog.open();
    /*if (!_source.editing) {
        _source._ensurePopup();
        _source.view.actor.vscroll.adjustment.value = 0;
        _source._openSpaceForPopup();
        _source._items.foreach(function (item) {
            item.deletable = true;
            item.wiggle();
        });
        _source.editing = true;
    }*/
}


function _onCreateFolderBtnClick() {
    if (this._hidden)
        return;

    if (this.selected_apps.length === 0)
        return;

    let dialog = new FolderDialog.FolderDialog();



    dialog.connect('closed', Lang.bind(this, function () {
        let name = dialog.output;
        Util.add_folder(name);
        Util.add_apps(name, this.selected_apps);
        this.cancel_selection();
    }));

    dialog.open();
}

function _onFolderBtnClick() {
    if (this._hidden)
        return;
    if (this.selecting) {
        this.cancel_selection();
    } else {
        this.enable_selection();
    }

}





function get_settings() {
    return this.settings;
}
