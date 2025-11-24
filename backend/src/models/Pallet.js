const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pallet = sequelize.define('Pallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  palletNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'pallet_number',
    validate: {
      notEmpty: true
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'full', 'maintenance'),
    defaultValue: 'available'
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0
    }
  },
  currentLoad: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_load',
    validate: {
      min: 0
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'pallets',
  timestamps: true,
  underscored: true
});

module.exports = Pallet;
