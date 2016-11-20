/* exported setup, cleanup, connect, is_hidden, disconnect, get_search_results, get_frequent_view, _onButtonPress, _onClicked, _onCreateFolderBtnClick, _onDestroy, _onFolderBtnClick, _onLeaveEvent, _onMenuPoppedDown, _onTouchEvent */

const Mainloop = imports.mainloop;
const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const FolderDialog = Me.imports.folder_dialog;
const FolderUtil = Me.imports.folder_util;
const Selection = Me.imports.selection;

const AppDisplay = imports.ui.appDisplay;
const ViewSelector = imports.ui.viewSelector;


function setup() {
    this._hidden = false;

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
    this._newFolderBtn.child = new St.Icon({ icon_name: 'folder-new-symbolic', fallback_icon_name: 'folder-new', icon_size: 32 });

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

    Main.overview.viewSelector.appDisplay.actor.add_actor(this.folder_box);

    Mainloop.idle_add(Lang.bind(this, function() {
        get_app_view()._redisplay();
        return false;
    }));
}

function cleanup() {
    this._hidden = null;

    this.folder_box = null;
    this._newFolderBtn = null;
    this._createFolderBtn = null;
    this._cancelFolderBtn = null;

    this.overviewHiddenSig = null;
    this.overviewShownSig = null;
    this.viewSelectorSig = null;
    this.pickerSig = null;
    this.appViewSig = null;
}

function connect() {
    this.overviewHiddenSig = Main.overview.connect('hiding', Lang.bind(this, function() {
        Selection.cancel_selection();
    }));

    this.overviewShownSig = Main.overview.connect('showing', Lang.bind(this, function() {
        if (!AppDisplay._fc_loaded_mods) {
            log('Modded App Icons Loaded.');
            get_app_view()._redisplay();
        }
    }));

    this.viewSelectorSig = Main.overview.viewSelector.connect('page-changed', Lang.bind(this, function() {
        if (Main.overview.viewSelector.getActivePage() === ViewSelector.ViewPage.APPS) {
            if (global.settings.get_uint('app-picker-view') === AppDisplay.Views.ALL) {
                show_selection_tools();
            } else {
                hide_selection_tools();
            }
        } else {
            hide_selection_tools();
            Selection.cancel_selection();
        }

    }));

    this.pickerSig = global.settings.connect('changed::app-picker-view', Lang.bind(this, function() {
        if (global.settings.get_uint('app-picker-view') === AppDisplay.Views.ALL) {
            show_selection_tools();
        } else {
            hide_selection_tools();
        }
    }));

    this.appViewSig = get_app_view().connect('modded-icon-created', Lang.bind(this, function(n, icon) {
        const app_ = icon.app;

        icon.actor.connect('clicked', Lang.bind(this, function(actor, button) {
            if (Selection.get_selection().indexOf(app_.id) === -1) {
                Selection.add_selection(app_.id);
            } else {
                Selection.get_selection().splice(Selection.get_selection().indexOf(app_.id), 1);
            }

        }));
    }));

}

function disconnect() {
    Main.overview.disconnect(this.overviewHiddenSig);
    Main.overview.disconnect(this.overviewShownSig);
    Main.overview.viewSelector.disconnect(this.viewSelectorSig);
    global.settings.disconnect(this.pickerSig);
    get_app_view().disconnect(this.appViewSig);

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

function get_frequent_view() {
    return Main.overview.viewSelector.appDisplay._views[AppDisplay.Views.FREQUENT].view;
}

function get_search_results() {
    return Main.overview.viewSelector._searchResults;
}

function is_hidden() {
    return this._hidden;
}


function _onCreateFolderBtnClick() {
    if (this._hidden)
        return;

    if (Selection.get_selection().length === 0)
        return;

    let dialog = new FolderDialog.FolderDialog();

    dialog.connect('closed', Lang.bind(this, function() {
        let name = dialog.output;
        FolderUtil.create_folder(name);
        FolderUtil.add_apps(name, Selection.get_selection());
        Selection.cancel_selection();
    }));

    dialog.open();
}

function _onFolderBtnClick() {
    if (this._hidden)
        return;
    if (Selection.is_active()) {
        Selection.cancel_selection();
    } else {
        Selection.enable_selection();
    }
}