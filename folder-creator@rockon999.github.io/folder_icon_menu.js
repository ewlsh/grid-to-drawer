const Signals = imports.signals;
const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Extension = Me.imports.extension;
const Util = Me.imports.util;

const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;


const FolderIconMenu = new Lang.Class({
    Name: 'FolderIconMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function (source) {
        let side = St.Side.LEFT;
        if (Clutter.get_default_text_direction() === Clutter.TextDirection.RTL)
            side = St.Side.RIGHT;

        this.parent(source.actor, 0.5, side);

        // We want to keep the item hovered while the menu is up
        this.blockSourceEvents = true;

        this._source = source;

        this.actor.add_style_class_name('app-well-menu');

        // Chain our visibility and lifecycle to that of the source
        source.actor.connect('notify::mapped', Lang.bind(this, function () {
            if (!source.actor.mapped)
                this.close();
        }));
        source.actor.connect('destroy', Lang.bind(this, function () { this.actor.destroy(); }));

        Main.uiGroup.add_actor(this.actor);
    },

    _redisplay: function () {
        this.removeAll();

        let item = this._appendMenuItem("Edit Folder");
        item.connect('activate', Lang.bind(this, function () {
            Extension.edit_folder(this._source, this._source.id);
        }));

        item = this._appendMenuItem("Delete Folder");
        item.connect('activate', Lang.bind(this, function () {
            Util.delete_folder(this._source.id);
        }));
    },

    _appendSeparator: function () {
        let separator = new PopupMenu.PopupSeparatorMenuItem();
        this.addMenuItem(separator);
    },

    _appendMenuItem: function (labelText) {
        // TODO: app-well-menu-item style
        let item = new PopupMenu.PopupMenuItem(labelText);
        this.addMenuItem(item);
        return item;
    },

    popup: function (activatingButton) {
        this._redisplay();
        this.open();
    }
});
Signals.addSignalMethods(FolderIconMenu.prototype);