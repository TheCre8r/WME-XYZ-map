// ==UserScript==
// @name        WME XYZ Map
// @namespace
// @description
// @include     /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @icon
// @version     0.0.0.1
// @grant       none
// ==/UserScript==

/* global W, I18n, OL, google, WazeWrap, $ */

(function() {
    function init() {
        log("Init Ran")
        // Add the map layer, hidden by default
        I18n.translations[I18n.currentLocale()].layers.name.coh_drone_map = 'CoH';
        var CoHLayer = new OL.Layer.XYZ('CoH Layer', 'https://operationserver.ci.henderson.nc.us/arcgis/rest/services/Basemaps/Drone_Map/MapServer/tile/${z}/${y}/${x}', {
        //var CoHLayer = new OL.Layer.XYZ('CoH Layer', 'https://services.nconemap.gov/secure/rest/services/Imagery/Orthoimagery_latest_cached/ImageServer/tile/${z}/${y}/${x}', {

            isBaseLayer: false,
            uniqueName: 'coh_drone_map',
            tileSize: new OL.Size(256, 256),
            transitionEffect: 'resize',
            zoomOffset: 12,
            displayInLayerSwitcher: true,
            opacity: localStorage.WME_CoH ? JSON.parse(localStorage.WME_CoH).opacity : 1,
            visibility: true
        });
        W.map.addLayer(CoHLayer);

        // Add layer entry in the new layer drawer
        var displayGroupToggle = document.getElementById('layer-switcher-group_display');
        if (displayGroupToggle != null) {
            var displayGroup = displayGroupToggle.parentNode;
            while (displayGroup != null && displayGroup.className != 'group') {
                displayGroup = displayGroup.parentNode;
            }
            var togglesList = displayGroup.querySelector('.collapsible-GROUP_DISPLAY');
            var toggler = document.createElement('li');
            var checkbox = document.createElement('wz-checkbox');
            checkbox.id = 'layer-switcher-item_street_view';
            checkbox.type = 'checkbox';
            checkbox.className = 'hydrated';
            checkbox.textContent = 'CoH Layer';
            checkbox.addEventListener('click', function(e) {
                CoHLayer.setVisibility(e.target.checked);
            });
            toggler.appendChild(checkbox);
            togglesList.appendChild(toggler);
            displayGroupToggle.addEventListener('click', function() {
                checkbox.disabled = !displayGroupToggle.checked;
                CoHLayer.setVisibility(checkbox.checked);
            });
        }

        // Create keyboard shortcut to toggle the imagery layer (Shift+H)
        I18n.translations[I18n.currentLocale()].keyboard_shortcuts.groups.layers.members.toggleCoHLayer = 'Toggle CoH Layer';
        W.accelerators.addAction('toggleCoHLayer', { group: 'layers' });
        W.accelerators.events.register('toggleCoHLayer', this, function() {
            CoHLayer.setVisibility(!CoHLayer.getVisibility());
            checkbox.checked = CoHLayer.getVisibility();
        });
        W.accelerators._registerShortcuts({ 'S+H': 'toggleCoHLayer' });


        // Deal with changes to the layer visibility
        CoHLayer.setZIndex(200);
        const checkLayerZIndex = () => { if (CoHLayer.getZIndex() !== 200) CoHLayer.setZIndex(200); };
        setInterval(() => { checkLayerZIndex(); }, 100);
    }

    function bootstrap(e,tries = 1) {
        //log("bootstrap attempt "+ tries);
        if (W && W.map && W.model && W.loginManager.user && $ && WazeWrap.Ready) {
            if (e && e.user === null) {
                log("Error 1");
                return;
            }
            if (typeof I18n === 'undefined') {
                setTimeout(bootstrap, 300);
                log("Error 2");
                return;
            }
            if (document.getElementById('layer-switcher') === null && document.getElementById('layer-switcher-group_display') === null) {
                setTimeout(bootstrap, 200);
                log("Error 3");
                return;
            }
            if (typeof W === 'undefined' ||
                typeof W.loginManager === 'undefined') {
                setTimeout(bootstrap, 100);
                log("Error 4");
                return;
            }
            if (!W.loginManager.user) {
                W.loginManager.events.register("login", null, init);
                log("Error 5");
            }
            init();
        }
        else if (tries < 1000) {
            setTimeout(() => bootstrap(tries++), 200);
        }
    }

    bootstrap();

    function log(message) {
        console.log("WME XYZ: " + message);
    }
})();
