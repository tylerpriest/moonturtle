# API functions

`reading.js` is the Cloudflare Pages Function for optional provider-generated daily readings.

It receives computed chart/current-sky data, not raw birth details. The client has a local symbolic reading engine, so this function can stay unconfigured during development.
