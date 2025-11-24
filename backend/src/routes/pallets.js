const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Pallet, Item, Log } = require('../models');
const { Op } = require('sequelize');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/pallets
 * Get all pallets with pagination
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { palletNumber: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Pallet.findAndCountAll({
      where,
      include: [{
        model: Item,
        as: 'items',
        attributes: ['id', 'sku', 'name', 'quantity']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      pallets: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pallets:', error);
    res.status(500).json({ error: 'Failed to fetch pallets' });
  }
});

/**
 * GET /api/pallets/:id
 * Get single pallet
 */
router.get('/:id', async (req, res) => {
  try {
    const pallet = await Pallet.findByPk(req.params.id, {
      include: [{
        model: Item,
        as: 'items'
      }]
    });

    if (!pallet) {
      return res.status(404).json({ error: 'Pallet not found' });
    }

    res.json(pallet);
  } catch (error) {
    console.error('Error fetching pallet:', error);
    res.status(500).json({ error: 'Failed to fetch pallet' });
  }
});

/**
 * POST /api/pallets
 * Create new pallet
 */
router.post('/', async (req, res) => {
  try {
    const pallet = await Pallet.create(req.body);

    // Log action
    await Log.create({
      action: 'CREATE',
      entityType: 'Pallet',
      entityId: pallet.id,
      userEmail: req.user.email,
      details: { pallet: pallet.toJSON() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('pallet:created', pallet);

    res.status(201).json(pallet);
  } catch (error) {
    console.error('Error creating pallet:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pallets/:id
 * Update pallet
 */
router.put('/:id', async (req, res) => {
  try {
    const pallet = await Pallet.findByPk(req.params.id);

    if (!pallet) {
      return res.status(404).json({ error: 'Pallet not found' });
    }

    const oldData = pallet.toJSON();
    await pallet.update(req.body);

    // Log action
    await Log.create({
      action: 'UPDATE',
      entityType: 'Pallet',
      entityId: pallet.id,
      userEmail: req.user.email,
      details: { 
        before: oldData, 
        after: pallet.toJSON() 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('pallet:updated', pallet);

    res.json(pallet);
  } catch (error) {
    console.error('Error updating pallet:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/pallets/:id
 * Delete pallet
 */
router.delete('/:id', async (req, res) => {
  try {
    const pallet = await Pallet.findByPk(req.params.id, {
      include: [{
        model: Item,
        as: 'items'
      }]
    });

    if (!pallet) {
      return res.status(404).json({ error: 'Pallet not found' });
    }

    // Check if pallet has items
    if (pallet.items && pallet.items.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete pallet with items. Please remove items first.' 
      });
    }

    const palletData = pallet.toJSON();
    await pallet.destroy();

    // Log action
    await Log.create({
      action: 'DELETE',
      entityType: 'Pallet',
      entityId: req.params.id,
      userEmail: req.user.email,
      details: { pallet: palletData },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('pallet:deleted', { id: req.params.id });

    res.json({ message: 'Pallet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pallet:', error);
    res.status(500).json({ error: 'Failed to delete pallet' });
  }
});

/**
 * POST /api/pallets/:id/items/:itemId
 * Assign item to pallet
 */
router.post('/:id/items/:itemId', async (req, res) => {
  try {
    const pallet = await Pallet.findByPk(req.params.id);
    const item = await Item.findByPk(req.params.itemId);

    if (!pallet) {
      return res.status(404).json({ error: 'Pallet not found' });
    }

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await item.update({ palletId: pallet.id });

    // Log action
    await Log.create({
      action: 'ASSIGN_ITEM',
      entityType: 'Pallet',
      entityId: pallet.id,
      userEmail: req.user.email,
      details: { 
        palletId: pallet.id,
        itemId: item.id 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('pallet:item_assigned', { pallet, item });

    res.json({ message: 'Item assigned to pallet successfully', pallet, item });
  } catch (error) {
    console.error('Error assigning item:', error);
    res.status(500).json({ error: 'Failed to assign item to pallet' });
  }
});

/**
 * DELETE /api/pallets/:id/items/:itemId
 * Remove item from pallet
 */
router.delete('/:id/items/:itemId', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await item.update({ palletId: null });

    // Log action
    await Log.create({
      action: 'REMOVE_ITEM',
      entityType: 'Pallet',
      entityId: req.params.id,
      userEmail: req.user.email,
      details: { 
        palletId: req.params.id,
        itemId: item.id 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('pallet:item_removed', { palletId: req.params.id, itemId: item.id });

    res.json({ message: 'Item removed from pallet successfully' });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove item from pallet' });
  }
});

module.exports = router;
