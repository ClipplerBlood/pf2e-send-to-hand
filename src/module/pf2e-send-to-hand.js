import { preloadTemplates } from './preloadTemplates.js';
import {
  defaultEquipButtons,
  getEquipStatusHeaderButton,
  getItemEquipStatus,
  setItemEquipStatus,
} from './equip-utils.js';

// Initialize module
Hooks.once('init', async () => {
  console.log('pf2e-send-to-hand | Initializing pf2e-send-to-hand');
  await preloadTemplates();
});

// Alternative hook getItemSheetPF2eHeaderButtons
Hooks.on('getItemSheetHeaderButtons', (sheet, buttons) => {
  const item = sheet.document;

  // Check if the item is equipped and owned
  if (!(item.parent instanceof Actor && item.isOwner)) return buttons;

  // Get the equip status of item, and default button
  const equipStatus = getItemEquipStatus(item);
  const btn = defaultEquipButtons[equipStatus];
  if (!btn) {
    console.error('pf2e-send-to-hand | Equip status not found for item', item);
    return buttons;
  }

  // Add a class to the button, the click callback and prepend it to the list of buttons
  btn.class = 'pf2e-send-to-hand';
  btn.onclick = (ev) => openHandSelectionDialog(item, ev);
  buttons.splice(0, 0, btn);
});

Hooks.on('updateItem', (item, updateData, _options, _userId) => {
  // When an item updates its carry state, refresh its open window header buttons
  if (updateData?.system?.equipped == null) return;
  if (item.sheet) refreshHeader(item.sheet);
});

function refreshHeader(app) {
  let header = app.element.find('.header-button.pf2e-send-to-hand');
  header = header?.get(0);
  if (!header) return;
  const equipStatus = getItemEquipStatus(app.document);
  header.innerHTML = getEquipStatusHeaderButton(equipStatus);
}

/**
 * Opens the Hand Selection Dialog of an item, after a click
 * @param {Item} item
 * @param {MouseEvent} _ev
 * @return {Promise<void>}
 */
async function openHandSelectionDialog(item, _ev = undefined) {
  const template = 'modules/pf2e-send-to-hand/templates/equip-selector-dialog.html';
  const templateData = {
    item: item,
    equipStatus: getItemEquipStatus(item),
    isArmor: item.type === 'armor',
  };

  const saveCallback = (html) => {
    const equipStatus = html.find('select[name=equipStatus]').val();
    setItemEquipStatus(item, equipStatus);
  };

  const dialog = new Dialog({
    title: game.i18n.format('pf2eSth.equipDialog.title', { name: item.name }),
    content: await renderTemplate(template, templateData),
    buttons: {
      submit: {
        label: 'Save',
        callback: (html) => saveCallback(html),
        icon: `<i class="fas fa-check"></i>`,
      },
      close: {
        label: 'Close',
        callback: () => null,
        icon: `<i class="fas fa-times"></i>`,
      },
    },
  });

  dialog.render(true);
}

Hooks.on('openPf2eSendToHandDialog', (item) => {
  if (!(item.parent instanceof Actor && item.isOwner)) return;
  return openHandSelectionDialog(item);
});

Hooks.on('renderTokenActionHUD', (_app, element, _data) => {
  element.find('#tah-category-items button[value^="item|"]').each((_, button) => {
    // Grab data from html
    const value = button.getAttribute('value');
    const split = value.split('|');
    const tokenId = split[1];
    const itemId = split[2];
    if (!tokenId || !itemId) return;

    // Get actor and item
    const actor = game.scenes.current.tokens.get(tokenId)?.actor;
    const item = actor?.items.get(itemId);
    if (!actor || !item) return;

    // Add the event listener
    button.addEventListener('auxclick', (ev) => {
      if (ev.button === 1) return openHandSelectionDialog(item);
    });
  });
});
