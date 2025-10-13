const path = require('path');
const express = require('express');
const authenticate = require('../../middleware/admin.auth');
const router = express.Router();

router.get('/download-sample',authenticate, (req, res) => {
    const filePath = path.join(__dirname, '../../assets/excel/Sample.xlsx');

    res.download(filePath, 'Sample.xlsx', (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Failed to download sample file');
        }
    });
});

module.exports = router;
