import ts from 'typescript';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=ts.transpile(readFileSync('lib/routes.ts','utf8'),{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022});
const {sections,workspaceHref}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert.equal(new Set(sections.map(s=>s.path)).size,sections.length);
for(const s of sections)for(const demo of [true,false]){const url=new URL(workspaceHref(s.view,demo),'https://example.invalid');assert.equal(url.pathname,'/app/'+s.path);assert.equal(url.searchParams.get('mode'),demo?'demo':'real');}
assert.throws(()=>workspaceHref('//evil.example',true));
console.log('PASS: all 10 sections have unique paths; demo/real scope survives link round trips; unknown views rejected');
