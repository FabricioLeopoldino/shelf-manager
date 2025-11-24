const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { Item, Log } = require('../models');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/shopify/products
 * Fetch products from Shopify
 */
router.get('/products', async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const shopifyUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyUrl || !accessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    const response = await axios.get(
      `${shopifyUrl}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken
        },
        params: {
          limit,
          page
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Shopify products:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Shopify products',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /api/shopify/sync
 * Sync products from Shopify to inventory
 */
router.post('/sync', async (req, res) => {
  try {
    const shopifyUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyUrl || !accessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    const response = await axios.get(
      `${shopifyUrl}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken
        },
        params: {
          limit: 250
        }
      }
    );

    const products = response.data.products;
    const syncResults = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const product of products) {
      for (const variant of product.variants) {
        try {
          const sku = variant.sku || `SHOPIFY-${variant.id}`;
          
          const [item, created] = await Item.findOrCreate({
            where: { 
              shopifyVariantId: variant.id.toString() 
            },
            defaults: {
              sku,
              name: `${product.title}${variant.title !== 'Default Title' ? ` - ${variant.title}` : ''}`,
              description: product.body_html,
              price: parseFloat(variant.price),
              quantity: variant.inventory_quantity || 0,
              shopifyProductId: product.id.toString(),
              shopifyVariantId: variant.id.toString(),
              imageUrl: product.images?.[0]?.src || null,
              barcode: variant.barcode || null,
              status: 'active'
            }
          });

          if (!created) {
            await item.update({
              name: `${product.title}${variant.title !== 'Default Title' ? ` - ${variant.title}` : ''}`,
              description: product.body_html,
              price: parseFloat(variant.price),
              quantity: variant.inventory_quantity || 0,
              imageUrl: product.images?.[0]?.src || null,
              barcode: variant.barcode || null
            });
            syncResults.updated++;
          } else {
            syncResults.created++;
          }
        } catch (error) {
          syncResults.errors.push({
            productId: product.id,
            variantId: variant.id,
            error: error.message
          });
        }
      }
    }

    // Log action
    await Log.create({
      action: 'SHOPIFY_SYNC',
      entityType: 'System',
      entityId: null,
      userEmail: req.user.email,
      details: syncResults,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('shopify:synced', syncResults);

    res.json({
      message: 'Shopify sync completed',
      results: syncResults
    });
  } catch (error) {
    console.error('Error syncing Shopify:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to sync Shopify products',
      details: error.response?.data || error.message
    });
  }
});

/**
 * PUT /api/shopify/inventory/:id
 * Update inventory quantity in Shopify
 */
router.put('/inventory/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!item.shopifyVariantId) {
      return res.status(400).json({ 
        error: 'Item not linked to Shopify' 
      });
    }

    const shopifyUrl = process.env.SHOPIFY_STORE_URL;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyUrl || !accessToken) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured' 
      });
    }

    // Get inventory item ID
    const variantResponse = await axios.get(
      `${shopifyUrl}/admin/api/2024-01/variants/${item.shopifyVariantId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken
        }
      }
    );

    const inventoryItemId = variantResponse.data.variant.inventory_item_id;

    // Get location ID (first available location)
    const locationsResponse = await axios.get(
      `${shopifyUrl}/admin/api/2024-01/locations.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken
        }
      }
    );

    const locationId = locationsResponse.data.locations[0].id;

    // Update inventory level
    await axios.post(
      `${shopifyUrl}/admin/api/2024-01/inventory_levels/set.json`,
      {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: quantity
      },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update local item
    await item.update({ quantity });

    // Log action
    await Log.create({
      action: 'SHOPIFY_INVENTORY_UPDATE',
      entityType: 'Item',
      entityId: item.id,
      userEmail: req.user.email,
      details: { 
        itemId: item.id,
        quantity 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ 
      message: 'Inventory updated in Shopify',
      item 
    });
  } catch (error) {
    console.error('Error updating Shopify inventory:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to update Shopify inventory',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;
