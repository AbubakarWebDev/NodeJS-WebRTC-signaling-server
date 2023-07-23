const Joi = require('joi');
const User = require('../models/User');
const isEmpty = require('lodash/isEmpty');
const debug = require('debug')('app:debug');
const { success, error, validation } = require("../utils/apiResponse");

// utility function for validate the user using Joi
function validateUser(user) {
    let userSchema = {
        username: Joi.string().alphanum().min(4).max(30).required(),
        firstName: Joi.string().min(3).required(),
        lastName: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        age: Joi.number().integer().min(3).max(120).required(),
    };

    const schema = Joi.object(userSchema);
    return schema.validate(user);
}

async function readAllUsers(req, res) {
    const users = await User.find();
    return res.status(200).json(success("OK", { data: users }, res.statusCode));
}

async function readSpecificUser(req, res) {
    const user = await User.findOne({ username: req.params.username });

    if (isEmpty(user)) {
        return res.status(404).json(error("The User with the given username is not exist!", res.statusCode));
    }

    return res.status(200).json(success("OK", { data: user }, res.statusCode));
}

async function createUser(req, res) {
    const { error: validationError } = validateUser(req.body);

    if (Joi.isError(validationError)) {
        debug(`createUser input validation Error: `, validationError);
        return res.status(422).json(validation(validationError.details.map(elem => elem.message)));
    }

    try {
        const user = new User(req.body);
        var result = await user.save();
    }
    catch (err) {
        debug(`createUser db Error: `, err);
        return res.status(500).json(error(err.message, res.statusCode));
    }

    return res.status(201).json(success("OK", { data: result }, res.statusCode));
}

async function updateUser(req, res) {
    const { validationError } = validateUser(req.body);

    if (Joi.isError(validationError)) {
        debug(`UpdateUser input validation Error: `, validationError);
        return res.status(422).json(validation(validationError.details.map(elem => elem.message)));
    }

    try {
        var user = await User.findOneAndUpdate({ username: req.params.username }, req.body, {
            new: true,
        });
    }
    catch (err) {
        debug(`updateUser db Error: `, err);
        return res.status(500).json(error(err.message, res.statusCode));
    }

    if (isEmpty(user)) {
        return res.status(404).json(error("The User with the given username is not exist!", res.statusCode));
    }

    return res.status(200).json(success("OK", { data: user }, res.statusCode));
}

async function deleteUser(req, res) {
    try {
        var user = await User.findOneAndDelete({ username: req.params.username }, req.body);
    }
    catch (err) {
        debug(`deleteUser db Error: `, err);
        return res.status(500).json(error(err.message, res.statusCode));
    }

    if (isEmpty(user)) {
        return res.status(404).json(error("The User with the given username is not exist!", res.statusCode));
    }

    return res.status(200).json(success("OK", { data: user }, res.statusCode));
}

module.exports = {
    readAllUsers,
    readSpecificUser,
    createUser,
    updateUser,
    deleteUser
}