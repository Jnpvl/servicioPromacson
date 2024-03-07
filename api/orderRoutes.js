require('dotenv').config();

const express = require('express');
const db = require('../database');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();


router.get('/', (req, res, next) => {
  db.query('SELECT * FROM pedidos', (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(results);
  });
});


router.post('/',
  [
    body('folio').notEmpty().withMessage('El folio es obligatorio'),
    body('destino').notEmpty().withMessage('El destino es obligatorio'),
    body('estatus').notEmpty().withMessage('El estatus es obligatorio'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folio, destino, estatus } = req.body;
    const fechaFacturacion = new Date();
    const query = 'INSERT INTO pedidos (folio, destino, fechaFacturacion, estatus) VALUES (?, ?, ?, ?)';
    db.query(query, [folio, destino, fechaFacturacion, estatus], (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({ folio, destino, fechaFacturacion, estatus });
    });
  }
);

router.put('/:folio',
  [
    param('folio').notEmpty().withMessage('El folio es obligatorio para actualizar'),
    body('destino').notEmpty().withMessage('El destino es obligatorio'),
    body('estatus').notEmpty().withMessage('El estatus es obligatorio'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folio } = req.params;
    const { destino, estatus } = req.body;
    const fechaFacturacion = new Date();
    const query = 'UPDATE pedidos SET destino = ?, fechaFacturacion = ?, estatus = ? WHERE folio = ?';
    db.query(query, [destino, fechaFacturacion, estatus, folio], (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ folio, destino, fechaFacturacion, estatus });
    });
  }
);


router.delete('/:folio',
  [
    param('folio').notEmpty().withMessage('El folio es obligatorio para eliminar')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { folio } = req.params;
    const query = 'DELETE FROM pedidos WHERE folio = ?';
    db.query(query, folio, (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(204).send();
    });
  }
);

module.exports = router;
