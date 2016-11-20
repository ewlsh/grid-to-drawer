/* exported patch, unpatch */

const Lang = imports.lang;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;
const UI = Me.imports.ui;

const AppDisplay = imports.ui.appDisplay;

const Shell = imports.gi.Shell;
const Gio = imports.gi.Gio;

const ORIG_getResultMetas = AppDisplay.AppSearchProvider.prototype.getResultMetas;
const ORIG_getInitialResultSet = AppDisplay.AppSearchProvider.prototype.getInitialResultSet;

function patch() {
    let app_provider = null;
    for (let provider of UI.get_search_results()._providers) {
        if (provider instanceof AppDisplay.AppSearchProvider) {
            app_provider = provider;
        }
    }
    if (app_provider !== null) {
        app_provider.getResultMetas = MOD_getResultMetas;
        app_provider.getInitialResultSet = MOD_getInitialResultSet;
    }
    AppDisplay.AppSearchProvider.prototype.getResultMetas = MOD_getResultMetas;
    AppDisplay.AppSearchProvider.prototype.getInitialResultSet = MOD_getInitialResultSet;
}

function unpatch() {
    let app_provider = null;
    for (let provider of UI.get_search_results()._providers) {
        if (provider instanceof AppDisplay.AppSearchProvider) {
            app_provider = provider;
        }
    }
    if (app_provider !== null) {
        app_provider.getResultMetas = ORIG_getResultMetas;
        app_provider.getInitialResultSet = ORIG_getInitialResultSet;
    }
    AppDisplay.AppSearchProvider.prototype.getResultMetas = ORIG_getResultMetas;
    AppDisplay.AppSearchProvider.prototype.getInitialResultSet = ORIG_getInitialResultSet;
}

function MOD_getResultMetas(apps, callback) {
    ORIG_getResultMetas.call(this, apps, Lang.bind(this, function(metas) {
        for (let meta of metas) {
            if (Settings.is_customized(meta.id) && Settings.has_custom_name(meta.id)) {
                meta.name = Settings.get_custom_name(meta.id);
            }
        }
        callback(metas);
    }));
}

function MOD_getInitialResultSet(terms, callback, cancellable) {
    let contains = [];
    let query = terms.join(' ');
    let groups = Shell.AppSystem.search(query);

    let groupPlacements = {};
    let currentPlacement = 0;

    /* Determine *if* a customized app is already in the search results and where it is placed in the groupings. */

    for (let group of groups) {
        for (let app_id of group) {
            // let app = Gio.DesktopAppInfo.new(app_id);
            if (Settings.is_customized(app_id) && Settings.has_custom_name(app_id)) {
                contains.push(app_id);
                groupPlacements[app_id] = currentPlacement;
            }
        }
        currentPlacement++;
    }

    /* Insert customized apps into the search under their *customized* name */

    for (let customized of Settings.get_customized()) {
        if (Settings.has_custom_name(customized)) {
            let name = Settings.get_custom_name(customized).toLowerCase();
            let index = name.toLowerCase().indexOf(query);
            if (index === -1)
                continue;

            let groupPlacement = groupPlacements[customized];
            let groupInsert = 0;
            let appInsert = -1;

            /* My rought weight calculation. Essentially it prefers names which
                                    ** contain the most of the search term and also how close to the
                                    ** beginning the search term is.
                                    */
            let weight = ((name.length - index) / name.length) * (name.length / query.length);
            let greater = true;

            for (let group of groups) {
                for (let app_id of group) {
                    let app = Gio.DesktopAppInfo.new(app_id);
                    if (app !== null) {
                        let app_index = app.get_name().toLowerCase().indexOf(query.toLowerCase());

                        let app_weight = ((app.get_name().length - app_index) / app.get_name().length) * (app.get_name().length / query.length);

                        if (app_index === -1 || app_weight < weight) {
                            greater = false;
                            break;
                        }
                    }
                    appInsert++;
                }
                if (!greater) {
                    break;
                }
                groupInsert++;
                appInsert = -1;
            }

            if (contains.indexOf(customized) === -1 || groupInsert !== groupPlacement) {
                if (groupInsert === groups.length) {
                    groups.push([customized]);
                } else {
                    if (appInsert === groups[groupInsert].length) {
                        groups[groupInsert].push(customized);
                    } else if (appInsert === -1) {
                        groups[groupInsert].unshift(customized);
                    } else {
                        groups[groupInsert].splice(appInsert, 0, customized);
                    }
                }

            }
        }
    }

    let usage = Shell.AppUsage.get_default();
    let results = [];
    groups.forEach(function(group) {
        group = group.filter(function(appID) {
            let app = Gio.DesktopAppInfo.new(appID);
            return app && app.should_show();
        });
        results = results.concat(group.sort(function(a, b) {
            return usage.compare('', a, b);
        }));
    });
    callback(results);
}
