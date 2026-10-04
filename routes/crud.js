const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const crudController = require('../controllers/crud');

/** API to save the message data in the database*/
router.post('/send-message', crudController.sendMessage);


module.exports = router;