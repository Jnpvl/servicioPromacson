require('dotenv').config();
const express = require('express');
const db = require('../database');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();
const util = require('util');
db.query = util.promisify(db.query); 


router.get('/', async (req, res, next) => {
  try {
    const results = await db.query('SELECT * FROM pedidos');
    res.status(200).json({
      message: "Pedidos recuperados con éxito",
      pedidos: results
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:folio', async (req, res) => {
  const { folio } = req.params;
  try {
    const results = await db.query('SELECT * FROM pedidos WHERE folio = ?', [folio]);
    if (results.length > 0) {
      res.status(200).json({
        message: "Pedido encontrado con éxito",
        pedido: results[0]
      });
    } else {
      res.status(404).json({ message: "Pedido no encontrado" });
    }
  } catch (err) {
    console.error('Error al recuperar los detalles del pedido:', err);
    res.status(500).json({ message: "Error al recuperar los detalles del pedido", error: err.message });
  }
});


router.post('/', [
  body('folio').trim().isLength({ min: 1 }).withMessage('Folio es requerido.'),
  body('cliente').trim().isLength({ min: 1 }).withMessage('Cliente es requerido.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { folio, cliente } = req.body;
  const query = 'INSERT INTO pedidos (folio, cliente, estatus, HoraF) VALUES (?, ?, "Facturado", NOW())';
  const queryParams = [folio, cliente];


  try {
    await db.query(query, queryParams);
    res.status(201).json({ success: true, message: 'Pedido creado con éxito.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: `El folio ${folio} ya existe. Por favor, usa un folio diferente.` });
    }
    console.error('Error al insertar el pedido:', error);
    res.status(500).json({ success: false, message: 'Error al crear el pedido', error: error.message });
  }
});

router.put('/:folio', async (req, res) => {
  const { folio } = req.params;
  const { estatus, cliente } = req.body; 

  let query;
  let queryParams;

  switch (estatus) {
    case 'Facturado':
      query = 'UPDATE pedidos SET cliente = ?, estatus = ?, HoraF = NOW() WHERE folio = ?';
      queryParams = [cliente, estatus, folio];
      break;
    case 'Cargado':
      query = 'UPDATE pedidos SET cliente = ?, estatus = ?, HoraC = NOW() WHERE folio = ?';
      queryParams = [cliente, estatus, folio];
      break;
    case 'En ruta':
      query = 'UPDATE pedidos SET cliente = ?, estatus = ?, HoraR = NOW() WHERE folio = ?';
      queryParams = [cliente, estatus, folio];
      break;
    case 'Entregado':
      query = 'UPDATE pedidos SET cliente = ?, estatus = ?, HoraE = NOW() WHERE folio = ?';
      queryParams = [cliente, estatus, folio];
      break;
    default:
      return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const result = await db.query(query, queryParams);
    if (result.affectedRows > 0) {
      const updatedResults = await db.query('SELECT * FROM pedidos WHERE folio = ?', [folio]);
      if (updatedResults.length > 0) {
        res.json({
          success: true,
          message: 'Pedido actualizado correctamente.',
          pedido: updatedResults[0] 
        });
      } else {
        res.status(404).json({ success: false, message: 'Pedido no encontrado después de la actualización.' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }




});

router.delete('/:folio', (req, res, next) => {
  const { folio } = req.params;
  db.query('SELECT * FROM pedidos WHERE folio = ?', folio, (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.length === 0) {
      return res.status(404).json({
        message: "Pedido no encontrado o ya fue eliminado"
      });
    }
    const query = 'DELETE FROM pedidos WHERE folio = ?';
    db.query(query, folio, (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        message: "Pedido eliminado con éxito"
      });
    });
  });
});


module.exports = router;
