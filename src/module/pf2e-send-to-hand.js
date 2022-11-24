import { preloadTemplates } from './preloadTemplates.js';

// Initialize module
Hooks.once('init', async () => {
  console.log('pf2e-send-to-hand | Initializing pf2e-send-to-hand');
  await preloadTemplates();
});
