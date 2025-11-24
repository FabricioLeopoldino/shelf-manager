const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Log } = require('../models');
const { Op } = require('sequelize');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/logs
 * Get all logs with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action = '', 
      entityType = '',
      userEmail = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Action filter
    if (action) {
      where.action = action;
    }

    // Entity type filter
    if (entityType) {
      where.entityType = entityType;
    }

    // User email filter
    if (userEmail) {
      where.userEmail = { [Op.iLike]: `%${userEmail}%` };
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await Log.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.json({
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * GET /api/logs/:id
 * Get single log entry
 */
router.get('/:id', async (req, res) => {
  try {
    const log = await Log.findByPk(req.params.id);

    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

/**
 * GET /api/logs/stats/summary
 * Get log statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalLogs = await Log.count();
    
    const actionCounts = await Log.findAll({
      attributes: [
        'action',
        [Log.sequelize.fn('COUNT', Log.sequelize.col('action')), 'count']
      ],
      group: ['action'],
      order: [[Log.sequelize.fn('COUNT', Log.sequelize.col('action')), 'DESC']],
      limit: 10
    });

    const recentActivity = await Log.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      totalLogs,
      actionCounts,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

/**
 * DELETE /api/logs/cleanup
 * Delete old logs (older than specified days)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const deletedCount = await Log.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate
        }
      }
    });

    // Log the cleanup action
    await Log.create({
      action: 'LOG_CLEANUP',
      entityType: 'System',
      entityId: null,
      userEmail: req.user.email,
      details: { 
        deletedCount,
        days: parseInt(days),
        cutoffDate
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ 
      message: `Deleted ${deletedCount} logs older than ${days} days`,
      deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ error: 'Failed to cleanup logs' });
  }
});

module.exports = router;
