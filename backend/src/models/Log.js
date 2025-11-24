const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'entity_type',
    validate: {
      notEmpty: true
    }
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'entity_id'
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_email',
    validate: {
      isEmail: true
    }
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  tableName: 'logs',
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = Log;
