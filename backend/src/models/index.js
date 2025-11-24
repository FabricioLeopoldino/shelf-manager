const Item = require('./Item');
const Pallet = require('./Pallet');
const Log = require('./Log');

// Define associations
Item.belongsTo(Pallet, {
  foreignKey: 'palletId',
  as: 'pallet'
});

Pallet.hasMany(Item, {
  foreignKey: 'palletId',
  as: 'items'
});

module.exports = {
  Item,
  Pallet,
  Log
};
