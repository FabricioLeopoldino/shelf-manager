const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Item, Pallet, Log } = require('../models');
const { Op } = require('sequelize');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/inventory
 * Get all inventory items with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      category = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Item.findAndCountAll({
      where,
      include: [{
        model: Pallet,
        as: 'pallet',
        attributes: ['id', 'palletNumber', 'location']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      items: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * GET /api/inventory/:id
 * Get single inventory item
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [{
        model: Pallet,
        as: 'pallet'
      }]
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * POST /api/inventory
 * Create new inventory item
 */
router.post('/', async (req, res) => {
  try {
    const item = await Item.create(req.body);

    // Log action
    await Log.create({
      action: 'CREATE',
      entityType: 'Item',
      entityId: item.id,
      userEmail: req.user.email,
      details: { item: item.toJSON() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('inventory:created', item);

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/inventory/:id
 * Update inventory item
 */
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const oldData = item.toJSON();
    await item.update(req.body);

    // Log action
    await Log.create({
      action: 'UPDATE',
      entityType: 'Item',
      entityId: item.id,
      userEmail: req.user.email,
      details: { 
        before: oldData, 
        after: item.toJSON() 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('inventory:updated', item);

    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/inventory/:id
 * Delete inventory item
 */
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const itemData = item.toJSON();
    await item.destroy();

    // Log action
    await Log.create({
      action: 'DELETE',
      entityType: 'Item',
      entityId: req.params.id,
      userEmail: req.user.email,
      details: { item: itemData },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('inventory:deleted', { id: req.params.id });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

/**
 * PATCH /api/inventory/:id/quantity
 * Update item quantity
 */
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const oldQuantity = item.quantity;
    let newQuantity = oldQuantity;

    if (operation === 'add') {
      newQuantity += parseInt(quantity);
    } else if (operation === 'subtract') {
      newQuantity -= parseInt(quantity);
    } else {
      newQuantity = parseInt(quantity);
    }

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    await item.update({ quantity: newQuantity });

    // Log action
    await Log.create({
      action: 'QUANTITY_UPDATE',
      entityType: 'Item',
      entityId: item.id,
      userEmail: req.user.email,
      details: { 
        oldQuantity, 
        newQuantity, 
        operation 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('inventory:quantity_updated', item);

    res.json(item);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/inventory/stats/summary
 * Get inventory statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalItems = await Item.count();
    const activeItems = await Item.count({ where: { status: 'active' } });
    const lowStockItems = await Item.count({
      where: {
        quantity: { [Op.lte]: Item.sequelize.col('min_quantity') }
      }
    });

    const totalValue = await Item.sum('price', {
      where: { status: 'active' }
    });

    res.json({
      totalItems,
      activeItems,
      lowStockItems,
      totalValue: totalValue || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
