import fs from 'node:fs/promises';

const audience='https://luc-lukas.com/stats-updater';
const requestURL=new URL(process.env.ACTIONS_ID_TOKEN_REQUEST_URL);
if(requestURL.protocol!=='https:'||!requestURL.hostname.endsWith('.actions.githubusercontent.com'))throw new Error('Unexpected identity provider');
requestURL.searchParams.set('audience',audience);
const identity=await fetch(requestURL,{signal:AbortSignal.timeout(10000),headers:{Authorization:`Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`}});
if(!identity.ok)throw new Error(`GitHub identity request failed: HTTP ${identity.status}`);
const {value:token}=await identity.json();
if(!token)throw new Error('GitHub did not issue a job identity');
const body=await fs.readFile(new URL('../data/stats.json',import.meta.url),'utf8');
const response=await fetch('https://luc-lukas.com/api/stats-ingest',{method:'POST',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body});
if(!response.ok)throw new Error(`Stats publication failed: HTTP ${response.status}`);
console.log('Published verified public snapshots:',(await response.json()).accepted.join(', '));
