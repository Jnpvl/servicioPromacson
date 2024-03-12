const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = '2h'; 

router.post('/', (req, res) => {
  const { nombre, contraseña } = req.body;
  const query = 'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ? AND estatus = "activo"';

  db.query(query, [nombre, contraseña], (err, results) => {
    if (err) {
      console.error('Error al buscar el usuario:', err);
      res.status(500).send('Error al iniciar sesión');
      return;
    }

    if (results.length > 0) {
      const usuario = results[0];
      
      delete usuario.contraseña; 

      const token = jwt.sign(
        { usuarioId: usuario.id, nombre: usuario.nombre },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        usuario, 
        token
      });
    } else {
      res.status(401).send('Usuario no encontrado, contraseña incorrecta o usuario no activo');
      
    }
  });
});


module.exports = router;
