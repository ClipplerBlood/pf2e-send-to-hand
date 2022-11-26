export const defaultEquipButtons = {
  held1: {
    label: 'pf2eSth.held1',
    icon: 'fa-solid fa-hand-fist',
  },
  held2: {
    label: 'pf2eSth.held2',
    icon: 'fa-solid fa-hands',
  },
  wornArmor: {
    label: 'pf2eSth.wornArmor',
    icon: 'fas fa-tshirt fa-fw',
  },
  carried: {
    label: 'pf2eSth.carried',
    icon: 'fa-solid fa-sack',
  },
  dropped: {
    label: 'pf2eSth.dropped',
    icon: 'fa-solid fa-arrow-up-from-ground-water',
  },
};

export function getItemEquipStatus(item) {
  const equipped = item.system.equipped;
  if (equipped.carryType === 'held') {
    if (equipped.handsHeld === 1) return 'held1';
    else if (equipped.handsHeld === 2) return 'held2';
  }
  if (equipped.carryType === 'worn') {
    if (equipped.inSlot) return 'wornArmor';
    else return 'carried';
  }
  if (equipped.carryType === 'dropped') return 'dropped';
}

export async function setItemEquipStatus(item, equipStatus) {
  let equippedData;
  if (equipStatus === 'held1')
    equippedData = {
      carryType: 'held',
      handsHeld: 1,
    };
  else if (equipStatus === 'held2')
    equippedData = {
      carryType: 'held',
      handsHeld: 2,
    };
  else if (equipStatus === 'wornArmor')
    equippedData = {
      carryType: 'worn',
      inSlot: true,
    };
  else if (equipStatus === 'carried') {
    equippedData = {
      carryType: 'worn',
    };
    if (item.type === 'armor') equippedData.inSlot = false;
  } else if (equipStatus === 'dropped') equippedData = { carryType: 'dropped' };

  if (!equippedData) return console.error('pf2e-send-to-hand | Equip status not found for item', item, equipStatus);
  return item.update({ 'system.equipped': equippedData });
}

export function i18n(x) {
  return game.i18n.localize(x);
}

export function getEquipStatusHeaderButton(equipStatus) {
  let html = '';
  if (equipStatus === 'held1') html += '<i class="fa-solid fa-hand-fist"></i>';
  else if (equipStatus === 'held2') html += '<i class="fa-solid fa-hands"></i>';
  else if (equipStatus === 'wornArmor') html += '<i class="fas fa-tshirt fa-fw"></i>';
  else if (equipStatus === 'carried') html += '<i class="fa-solid fa-sack"></i>';
  else if (equipStatus === 'dropped') html += '<i class="fa-solid fa-arrow-up-from-ground-water"></i>';
  else return;
  html += i18n('pf2eSth.' + equipStatus);
  return html;
}
