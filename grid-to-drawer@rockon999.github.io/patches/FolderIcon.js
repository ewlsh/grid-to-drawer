/* exported patch, unpatch */

const Lang = imports.lang;

const Clutter = imports.gi.Clutter;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const FolderIconMenu = Me.imports.folder_icon_menu;

const AppDisplay = imports.ui.appDisplay;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;

const ORIG_folder_init = AppDisplay.FolderIcon.prototype._init;
const ORIG_folder_onButtonPress = AppDisplay.FolderIcon.prototype._onButtonPress;
const ORIG_folder_onTouchEvent = AppDisplay.FolderIcon.prototype._onTouchEvent;
const ORIG_folder_onDestroy = AppDisplay.FolderIcon.prototype._onDestroy;

const APPICON_onButtonPress = AppDisplay.AppIcon.prototype._onButtonPress;

function patch() {
    AppDisplay.FolderIcon.prototype._setPopupTimeout = AppDisplay.AppIcon.prototype._setPopupTimeout;
    AppDisplay.FolderIcon.prototype._removeMenuTimeout = AppDisplay.AppIcon.prototype._removeMenuTimeout;
    AppDisplay.FolderIcon.prototype._onMenuPoppedDown = AppDisplay.AppIcon.prototype._onMenuPoppedDown;
    AppDisplay.FolderIcon.prototype._onLeaveEvent = AppDisplay.AppIcon.prototype._onLeaveEvent;
    AppDisplay.FolderIcon.prototype._onDestroy = AppDisplay.AppIcon.prototype._onDestroy;
    AppDisplay.FolderIcon.prototype._onTouchEvent = AppDisplay.AppIcon.prototype._onTouchEvent;

    // Filter out primary clicks.
    AppDisplay.FolderIcon.prototype._onButtonPress = MOD_onButtonPress;
    // Add popup menu.
    AppDisplay.FolderIcon.prototype.popupMenu = MOD_popupMenu;
    // Define necessary variables.
    AppDisplay.FolderIcon.prototype._init = MOD_init;
}

function unpatch() {
    delete AppDisplay.FolderIcon.prototype._setPopupTimeout;
    delete AppDisplay.FolderIcon.prototype._removeMenuTimeout;
    delete AppDisplay.FolderIcon.prototype._onMenuPoppedDown;
    delete AppDisplay.FolderIcon.prototype._onLeaveEvent;
    delete AppDisplay.FolderIcon.prototype.popupMenu;

    AppDisplay.FolderIcon.prototype._onDestroy = ORIG_folder_onDestroy;
    AppDisplay.FolderIcon.prototype._onTouchEvent = ORIG_folder_onTouchEvent;
    AppDisplay.FolderIcon.prototype._onButtonPress = ORIG_folder_onButtonPress;

    AppDisplay.FolderIcon.prototype._init = ORIG_folder_init;
}

function MOD_init() {
    ORIG_folder_init.apply(this, arguments);

    /* Add necessary variables from AppIcon. */
    this._menu = null;
    this._menuManager = new PopupMenu.PopupMenuManager(this);
    this._menuTimeoutId = 0;
    this._stateChangedId = 0;
    this.actor.connect('touch-event', Lang.bind(this, this._onTouchEvent));
    this.actor.connect('leave-event', Lang.bind(this, this._onLeaveEvent));
    this.actor.connect('button-press-event', Lang.bind(this, this._onButtonPress));
    this.actor.connect('destroy', Lang.bind(this, this._onDestroy));
}

function MOD_popupMenu() {
    this._removeMenuTimeout();
    this.actor.fake_release();

    if (this._draggable)
        this._draggable.fakeRelease();

    if (!this._menu) {
        this._menu = new FolderIconMenu.FolderIconMenu(this);
        this._menu.connect('activate-window', Lang.bind(this, function(menu, window) {
            this.activateWindow(window);
        }));
        this._menu.connect('open-state-changed', Lang.bind(this, function(menu, isPoppedUp) {
            if (!isPoppedUp)
                this._onMenuPoppedDown();
        }));
        let id = Main.overview.connect('hiding', Lang.bind(this, function() {
            this._menu.close();
        }));
        this.actor.connect('destroy', function() {
            Main.overview.disconnect(id);
        });

        this._menuManager.addMenu(this._menu);
    }

    this.emit('menu-state-changed', true);

    this.actor.set_hover(true);
    this._menu.popup();
    this._menuManager.ignoreRelease();
    this.emit('sync-tooltip');
    return false;
}

function MOD_onButtonPress(actor, event) {
    if (AppDisplay._fc_creating_new_folder) {
        return Clutter.EVENT_STOP;
    }

    if (event.get_button() === 1) {
        return Clutter.EVENT_PROPAGATE;
    }

    return APPICON_onButtonPress.apply(this, arguments);
}