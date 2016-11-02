/* exported FolderDialog */

const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = Me.imports.util;

const ModalDialog = imports.ui.modalDialog;
const ShellEntry = imports.ui.shellEntry;
const Gtk = imports.gi.Gtk;
const Tweener = imports.ui.tweener;

const CheckBox = imports.ui.checkBox;

const AppDisplay = imports.ui.appDisplay;

const Main = imports.ui.main;



// TODO: Translations.
const _ = function (a) { return a; };

const EditDialog = new Lang.Class({
    Name: 'EditDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function (selected_apps, folder_id) {
        this.parent({
            styleClass: 'run-dialog',
            destroyOnClose: false
        });

        this._appChecks = [];
        this.output = null;

        let label = new St.Label({
            style_class: 'run-dialog-label',
            text: _("Apps")
        });
        this.contentLayout.height = 800;
        this.contentLayout.add(label, {
            x_fill: false,
            y_fill: false,
            x_align: St.Align.START,
            y_align: St.Align.START
        });

        this._applicationList = new St.BoxLayout({
            style_class: 'end-session-dialog-app-list',
            vertical: true
        });

        this._scrollView = new St.ScrollView({ x_fill: true, y_fill: true });
        this._scrollView.get_hscroll_bar().hide();
        this._scrollView.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);
        this.contentLayout.add(this._scrollView, { x_fill: true, y_fill: true });

        this._scrollView.add_actor(this._applicationList);

        let view = Main.overview.viewSelector.appDisplay._views[AppDisplay.Views.ALL].view;
        let apps = view.getAllItems();

        /* Sort out any icons that are already in folders or are folders themselves. */
        apps = apps.filter(Lang.bind(this, function (value, index, array) {
            let folderid = Util.get_folder_for_app(value.id);
            if (value instanceof AppDisplay.AppIcon && (folderid === null || folderid === folder_id)) {
                return true;
            }
            return false;
        }));



        for (let app of apps) {
            let actor = new St.BoxLayout({
                style_class: 'end-session-dialog-app-list-item',
                can_focus: true
            });

            let check = new CheckBox.CheckBox();
            check.getLabelActor().text = '';
            actor.add(check.actor);

            this._appChecks.push([app.id, check]);

            let textLayout = new St.BoxLayout({
                vertical: true,
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER
            });
            actor.add(textLayout);

            let nameLabel = new St.Label({
                text: app.name,
                style_class: 'end-session-dialog-app-list-item-name'
            });
            textLayout.add(nameLabel);
            actor.label_actor = nameLabel;

            if (selected_apps.indexOf(app.id) !== -1) {
                check.actor.checked = true;
            } else {
                check.actor.checked = false;
            }


            this._applicationList.add(actor);
        }

        this.setButtons([
            {
                action: Lang.bind(this, this.done),
                label: "Close",
                key: Clutter.Escape
            },
            {
                action: Lang.bind(this, this.set_apps),
                label: "Save",
                'default': true
            }
        ]);
    },
    set_apps: function () {
        let apps = [];
        for (let [id, check] of this._appChecks) {
            if (check.actor.checked) {
                apps.push(id);
            }
        }

        this.popModal();
        this.output = apps;
        this.close();
    },
    done: function () {
        this.output = null;
        this.close();
    }
});
