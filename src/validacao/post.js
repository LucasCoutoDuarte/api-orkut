const Joi = require('joi');

function validarPost(req, res, next) {
    const { error } = schemaPost.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ erro: error.details.map(e => e.message) });
    }
    next();
}

module.exports =  validarPost;