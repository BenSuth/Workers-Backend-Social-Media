import { handleRequest } from './handler'

/* Main entry point for webpack / wrangler / node*/
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request))
})
