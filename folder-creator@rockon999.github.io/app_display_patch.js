/* exported patch */

const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Extension = Me.imports.extension;
const Settings = Me.imports.settings;

const AppDisplay = imports.ui.appDisplay;
//const Search = imports.ui.search;

const ORIG_loadApps = AppDisplay.AllView.prototype._loadApps;
const ORIG_getResultMetas = AppDisplay.AppSearchProvider.prototype.getResultMetas;


function patch() {
    AppDisplay.AllView.prototype._loadApps = MOD_loadApps;
    Extension.get_app_view()._loadApps = MOD_loadApps;
    let app_provider = null;
    for (let provider of Extension.get_search_results()._providers) {
        if (provider instanceof AppDisplay.AppSearchProvider) {
            app_provider = provider;
        }
    }
    if (app_provider !== null) {
        //    Extension.get_search_results()._unregisterProvider(app_provider);
        app_provider.getResultMetas = MOD_getResultMetas;
    }
    AppDisplay.AppSearchProvider.prototype.getResultMetas = MOD_getResultMetas;
}

function MOD_getResultMetas(apps, callback) {
    ORIG_getResultMetas.call(this, apps, Lang.bind(this, function (metas) {
        for (let meta of metas) {
            if (Settings.is_customized(meta.id) && Settings.has_custom_name(meta.id)) {
                meta.name = Settings.get_custom_name(meta.id);
            }
        }
        callback(metas);
    }));
}

function MOD_loadApps() {
    // Call the original.
    let result = ORIG_loadApps.apply(this, arguments);
    // Modify on demand.
    if (this.constructor === imports.ui.appDisplay.AllView) {
        this._allItems.forEach(Lang.bind(this, function (icon) {
            // Check to make sure the icon is an AppIcon.
            if (typeof (icon.app) !== 'undefined' && icon.app !== null) {
                icon._fc_selectable = true;
                icon._fc_selected = false;
                this.emit('modded-icon-created', icon, icon.app);
            }
        }));
        imports.ui.appDisplay._fc_loaded_mods = true;
    }

    return result;
}
