importScripts("/type-warrior/betaprecache-manifest.8d11b431a46e79bcbe6b803f60b7464a.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

/**
 * You should only modify this, if you know what you are doing.
 * This phaser template is using workbox (https://developers.google.com/web/tools/workbox/)
 * to precache all assets.
 * It uses the InjectManifest function from 'workbox-webpack-plugin' inside
 * webpack/webpack.common.js
 */
workbox.precaching.precacheAndRoute(__precacheManifest)
