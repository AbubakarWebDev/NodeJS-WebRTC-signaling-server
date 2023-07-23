const router = require('express').Router();

// For landing page
router.get('/', (req, res) => {
    res.render('home', {
        title: "Angular Node Mongo CRUD REST Api"
    })
});

module.exports = router;