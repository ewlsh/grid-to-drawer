/* exported EditAppDialog */

const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const ModalDialog = imports.ui.modalDialog;
const ShellEntry = imports.ui.shellEntry;


const CheckBox = imports.ui.checkBox;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

// TODO: Translations.
//const _ = function (a) { return a; };

const EditAppDialog = new Lang.Class({
    Name: 'EditAppDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function (app) {
        this.parent({
            styleClass: 'run-dialog',
            destroyOnClose: false
        });


        this.output = null;

        this._hbox = new St.BoxLayout();
        this._rightLayout = new St.BoxLayout({ style_class: 'end-session-dialog-app-list', vertical: true });
        this._rightLayout.set_style('padding-left: 20px;');
        this._leftLayout = new St.BoxLayout({ style_class: 'end-session-dialog-app-list', vertical: true });
        this._leftLayout.set_style('padding-right: 20px;');

        let check = new CheckBox.CheckBox();
        check.getLabelActor().text = "Custom App Name";
        this.nameCheck = check;

        this._rightLayout.add(check.actor, {
            x_fill: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });


        let entry = new St.Entry({
            style_class: 'run-dialog-entry',
            can_focus: true
        });

        this.nameEntry = entry;
        ShellEntry.addContextMenu(this.nameEntry);


        this.nameCheck.actor.connect('clicked', Lang.bind(this, function (check, mouse_button) {
            if (Settings.is_customized(this.app.id) && Settings.has_custom_name(this.app.id)) {
                this.nameEntry.set_text(Settings.get_custom_name(this.app.id));
            } else {
                this.nameEntry.set_text('');
            }

            this.nameEntry.reactive = check.checked;
            this.nameEntry.clutter_text.editable = check.checked;
        }));

        this._nameEntryText = entry.clutter_text;
        this._rightLayout.add(this.nameEntry, {
            y_align: St.Align.START
        });

        // ICON

        check = new CheckBox.CheckBox();
        check.getLabelActor().text = "Custom App Icon";

        this.iconCheck = check;

        this._rightLayout.add(check.actor, {
            x_fill: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        entry = new St.Entry({
            style_class: 'run-dialog-entry',
            can_focus: true
        });

        this.entry = entry;



        ShellEntry.addContextMenu(this.entry);


        this.iconCheck.actor.connect('clicked', Lang.bind(this, function (check, mouse_button) {
            if (Settings.is_customized(this.app.id) && Settings.has_custom_icon(this.app.id)) {
                this.entry.set_text(Settings.get_icon_path(this.app.id));
            } else {
                this.entry.set_text('');
            }

            this.entry.reactive = check.checked;
            this.entry.clutter_text.editable = check.checked;
        }));

        this._entryText = entry.clutter_text;
        this._rightLayout.add(this.entry, {
            y_align: St.Align.START
        });

        this.app = app;

        this.appIcon = this.app.create_icon_texture(64);
        this.appIcon.connect('button-press-event', Lang.bind(this, this.set_icon));

        this._leftLayout.add(this.appIcon, {
            y_align: St.Align.MIDDLE
        });

        this._hbox.add(this._leftLayout);
        this._hbox.add(this._rightLayout);

        this.contentLayout.add(this._hbox, {
            x_fill: true,
            y_fill: true,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this.setButtons([
            {
                action: Lang.bind(this, this.exit),
                label: "Close",
                key: Clutter.Escape
            },
            {
                action: Lang.bind(this, this.save),
                label: "Save",
                'default': true
            }
        ]);
    },
    set_name: function () {
        if (this.output === null)
            this.output = {};
        this.output['name_enabled'] = this.nameCheck.actor.checked;
        this.output['name'] = this.nameEntry.get_text();
    },
    set_icon_path: function () {
        if (this.output === null)
            this.output = {};
        this.output['icon_path_enabled'] = this.iconCheck.actor.checked;
        this.output['icon_path'] = this.entry.get_text();
    },
    exit: function () {
        this.close();
    },
    save: function () {
        this.set_icon_path();
        this.set_name();
        this.close();
    },
    open: function () {
        this.parent();

        if (Settings.is_customized(this.app.id) && Settings.has_custom_name(this.app.id)) {
            this.nameEntry.set_text(Settings.get_custom_name(this.app.id));
            this.nameCheck.actor.checked = true;
            this.setInitialKeyFocus(this.nameEntry.clutter_text);
        } else {
            this.nameEntry.set_text('');
            this.nameCheck.actor.checked = false;
        }
        if (Settings.is_customized(this.app.id) && Settings.has_custom_icon(this.app.id)) {
            this.entry.set_text(Settings.get_icon_path(this.app.id));
            this.iconCheck.actor.checked = true;

            if (!this.nameCheck.actor.checked) {
                this.setInitialKeyFocus(this.entry.clutter_text);
            }
        } else {
            this.entry.set_text('');
            this.iconCheck.actor.checked = false;
        }
        this.entry.reactive = this.iconCheck.actor.checked;
        this.entry.clutter_text.editable = this.iconCheck.actor.checked;
        this.nameEntry.reactive = this.nameCheck.actor.checked;
        this.nameEntry.clutter_text.editable = this.nameCheck.actor.checked;
    }
});