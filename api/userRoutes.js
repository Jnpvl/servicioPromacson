require('dotenv').config(); 
const express = require('express');
const db = require('../database');
const { body, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', ( req,res, next) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({
      message: "Usuarios recuperados con éxito",
      usuarios: results
    });
  });
});

router.post('/',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('contraseña').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('tipoUsuario').notEmpty().withMessage('El tipo de usuario es obligatorio'),
    body('estatus').notEmpty().withMessage('El estatus es obligatorio'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, contraseña, tipoUsuario, estatus } = req.body;
    const query = 'INSERT INTO usuarios (nombre, apellido, contraseña, tipoUsuario, estatus) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre, apellido, contraseña, tipoUsuario, estatus], (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({
        message: "Usuario creado con éxito",
        usuario: { id: result.insertId, nombre, apellido, tipoUsuario, estatus }
      });
    });
  }
);


router.put('/:id',
  (req, res, next) => {
    const { id } = req.params;
    const { nombre, apellido, tipoUsuario, estatus } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, apellido = ?, tipoUsuario = ?, estatus = ? WHERE id = ?';
    db.query(query, [nombre, apellido, tipoUsuario, estatus, id], (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        message: "Usuario actualizado con éxito",
        usuario: { id: parseInt(id, 10), nombre, apellido, tipoUsuario, estatus }
      });
    });
  }
);

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  db.query('SELECT * FROM usuarios WHERE id = ?', id, (err, results) => {
    if (err) {
      return next(err);
    }
    if (results.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado o ya fue eliminado"
      });
    }
    const query = 'DELETE FROM usuarios WHERE id = ?';
    db.query(query, id, (err, result) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({
        message: "Usuario eliminado con éxito"
      });
    });
  });
});


module.exports = router;
