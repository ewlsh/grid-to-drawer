/* exported patch, unpatch */

const Mainloop = imports.mainloop;
const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

const Main = imports.ui.main;
const Dash = imports.ui.dash;

let DashToDock = imports.misc.extensionUtils.extensions['dash-to-dock@micxgx.gmail.com'];
let DTD_createAppItem = null;

const ORIG_createAppItem = Dash.Dash.prototype._createAppItem;

function patch() {

    Dash.Dash.prototype._createAppItem = MOD_createAppItem;


    Mainloop.idle_add(Lang.bind(this, function() {
        if (typeof DashToDock === 'undefined' || DashToDock === null) {
            DashToDock = imports.misc.extensionUtils.extensions['dash-to-dock@micxgx.gmail.com'];
        }

        if (typeof DashToDock !== 'undefined' && DashToDock !== null) {
            DTD_createAppItem = DashToDock.imports.dash.MyDash.prototype._createAppItem;
            Main.overview._dash._createAppItem = MOD_DTD_createAppItem;
        } else {
            Main.overview._dash._createAppItem = MOD_createAppItem;
        }

        Main.overview._controls.dash._createAppItem = MOD_createAppItem;

        reload_dash_labels();

        // Main.overview._controls.dash._redisplay();
        // Main.overview._dash._redisplay();
        return false;
    }));

}

function unpatch() {
    if (typeof DashToDock !== 'undefined' && DashToDock !== null && DTD_createAppItem !== null) {
        Main.overview._dash._createAppItem = DTD_createAppItem;
    } else {
        Main.overview._dash._createAppItem = ORIG_createAppItem;
    }
    Dash.Dash.prototype._createAppItem = ORIG_createAppItem;
    Main.overview._controls.dash._createAppItem = ORIG_createAppItem;

}

function reload_dash_labels() {
    for (let child of Main.overview._controls.dash._box.get_children()) {
        let app = child.child._delegate.app;
        if (Settings.is_customized(app.id) && Settings.has_custom_name(app.id)) {
            child.setLabelText(Settings.get_custom_name(app.id));
        } else {
            child.setLabelText(app.get_name());
        }
    }

    for (let child of Main.overview._dash._box.get_children()) {
        let app = child.child._delegate.app;
        if (Settings.is_customized(app.id) && Settings.has_custom_name(app.id)) {
            child.setLabelText(Settings.get_custom_name(app.id));
        } else {
            child.setLabelText(app.get_name());
        }
    }
}

function MOD_createAppItem(app) {
    // Call the original.
    let result = ORIG_createAppItem.apply(this, arguments);

    if (Settings.is_customized(app.id) && Settings.has_custom_name(app.id)) {
        result.setLabelText(Settings.get_custom_name(app.id));
    }

    return result;
}

function MOD_DTD_createAppItem(app) {
    // Call the original.
    let result = null;

    if (typeof DashToDock !== 'undefined' && DashToDock !== null && DTD_createAppItem !== null) {
        result = DTD_createAppItem.apply(this, arguments);
    } else {
        result = ORIG_createAppItem.apply(this, arguments);
    }

    if (Settings.is_customized(app.id) && Settings.has_custom_name(app.id)) {
        result.setLabelText(Settings.get_custom_name(app.id));
    }

    return result;
}