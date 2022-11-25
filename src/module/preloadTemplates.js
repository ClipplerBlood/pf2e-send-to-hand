export async function preloadTemplates() {
  const templatePaths = ['modules/pf2e-send-to-hand/templates/equip-selector-dialog.html'];
  return loadTemplates(templatePaths);
}
