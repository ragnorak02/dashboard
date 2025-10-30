// services/instana.js
// services/instana.js
export function buildAPI() {
  console.log('build api responses');
  const pingResponse = ping();
  return pingResponse;
}


export function ping() {
  console.log('[instana] ping() reached');
  return 'ok';
}