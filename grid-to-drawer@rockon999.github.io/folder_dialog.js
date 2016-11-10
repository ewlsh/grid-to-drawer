/* exported FolderDialog */

const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const FolderUtil = Me.imports.folder_util;

const ModalDialog = imports.ui.modalDialog;
const ShellEntry = imports.ui.shellEntry;
const Tweener = imports.ui.tweener;


// TODO: Translations.
const _ = function (a) { return a; };

const FolderDialog = new Lang.Class({
    Name: 'FolderDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function () {
        this.parent({
            styleClass: 'run-dialog',
            destroyOnClose: false
        });


        this.output = null;

        let label = new St.Label({
            style_class: 'run-dialog-label',
            text: _("Enter A Name For Your Folder")
        });

        this.contentLayout.add(label, {
            x_fill: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        let entry = new St.Entry({
            style_class: 'run-dialog-entry',
            can_focus: true
        });

        this.entry = entry;
        ShellEntry.addContextMenu(entry);

        entry.label_actor = label;

        this._entryText = entry.clutter_text;
        this.contentLayout.add(entry, {
            y_align: St.Align.START
        });
        this.setInitialKeyFocus(this._entryText);

        this._errorBox = new St.BoxLayout({
            style_class: 'run-dialog-error-box'
        });

        this.contentLayout.add(this._errorBox, {
            expand: true
        });

        let errorIcon = new St.Icon({
            icon_name: 'dialog-error-symbolic',
            icon_size: 24,
            style_class: 'run-dialog-error-icon'
        });

        this._errorBox.add(errorIcon, {
            y_align: St.Align.MIDDLE
        });



        this._errorMessage = new St.Label({
            style_class: 'run-dialog-error-label'
        });
        this._errorMessage.clutter_text.line_wrap = true;

        this._errorBox.add(this._errorMessage, {
            expand: true,
            x_align: St.Align.START,
            x_fill: false,
            y_align: St.Align.MIDDLE,
            y_fill: false
        });

        this._errorBox.hide();

        this.setButtons([
            {
                action: Lang.bind(this, this.close),
                label: "Close",
                key: Clutter.Escape
            },
            {
                action: Lang.bind(this, this.set_name),
                label: "Set Name",
                'default': true
            }
        ]);
    },
    set_name: function () {
        let text = this.entry.get_text();
        if (typeof text === 'undefined' || text === null || text === '') {
            this._showError("Please Enter A Folder Name.");
            return;
        }
        if (FolderUtil.folder_exists(text)) {
            this._showError("That Folder Name Is Already In Use.");
            return;
        }
        this.popModal();
        this._run(text);
        this.close();
    },
    _run: function (name) {
        this.output = name;
    },
    _showError: function (message) {
        this._commandError = true;

        this._errorMessage.set_text(message);

        if (!this._errorBox.visible) {
            let [errorBoxMinHeight, errorBoxNaturalHeight] = this._errorBox.get_preferred_height(-1); // eslint-disable-line no-unused-vars

            let parentActor = this._errorBox.get_parent();
            Tweener.addTween(parentActor, {
                height: parentActor.height + errorBoxNaturalHeight,
                time: 0.1,
                transition: 'easeOutQuad',
                onComplete: Lang.bind(this,
                    function () {
                        parentActor.set_height(-1);
                        this._errorBox.show();
                    })
            });
        }
    },
    open: function () {
        this.parent();
        this._errorBox.hide();
        this._entryText.set_text('');

    }
});