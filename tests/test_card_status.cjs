// Test production banner code without a Home Assistant/browser installation.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const registry = {};
const ctx = {window:{}, console:{info(){},log(){}}, HTMLElement:class {},
 customElements:{define(name, cls){registry[name]=cls;}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('custom_components/vpmobile24/card.js','utf8'),ctx);
const banner=registry['vpmobile24-card'].prototype._dataStatus;
const render=(attributes,language='de',state='2')=>banner.call({_hass:{language}}, {attributes,state});
assert.equal(render({data_stale:false,last_successful_update:new Date().toISOString()}),'');
assert.match(render({data_stale:true}),/Daten veraltet/);
assert.match(render({data_stale:true},'en'),/Data stale/);
assert.match(render({data_stale:true},'fr'),/Données périmées/);
assert.match(render({last_successful_update:'2020-01-01T00:00:00Z'}),/Daten veraltet/);
assert.match(render({last_successful_update:'<script>alert(1)</script>'},'en','unavailable'),/Data stale/);
assert.ok(!render({data_stale:true,last_successful_update:'<script>alert(1)</script>'}).includes('<script>'));
assert.equal(fs.readFileSync('custom_components/vpmobile24/card.js','utf8'),fs.readFileSync('custom_components/vpmobile24/vpmobile24-card.js','utf8'));
console.log('Card status translations, age, invalid timestamp and shipped file parity passed.');
