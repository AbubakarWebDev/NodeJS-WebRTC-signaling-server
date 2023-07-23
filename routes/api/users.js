const router = require('express').Router();
const {
    readAllUsers,
    readSpecificUser,
    createUser,
    updateUser,
    deleteUser
} = require('../../controllers/usersController');

// For read all the users
router.get('/', readAllUsers);

// For read only specific user
router.get('/:username', readSpecificUser);

// For create user
router.post('/', createUser);

// For update a user
router.put('/:username', updateUser);

// For delete a user
router.delete('/:username', deleteUser);

module.exports = router;