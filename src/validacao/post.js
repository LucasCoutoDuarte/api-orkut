const Joi = require('joi');

const schemaPost = Joi.object({
    titulo: Joi.string().min(3).max(100).required().messages({
        "string.empty": 'O título é obrigatório',
        "string.min": 'O título deve conter pelo menos 3 caracteres',
        "string.max": 'O título deve conter no máximo 100 caracteres',
        "any.required": 'O título é obrigatório'
    }),
    conteudo: Joi.string().min(10).max(1000).required().messages({
        "string.empty": 'O conteúdo é obrigatório',
        "string.min": 'O conteúdo deve conter pelo menos 10 caracteres',
        "string.max": 'O conteúdo deve conter no máximo 1000 caracteres',
        "any.required": 'O conteúdo é obrigatório'
    })
});

function validarPost(req, res, next) {
    const { error } = schemaPost.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ erro: error.details.map(e => e.message) });
    }
    next();
}

module.exports = validarPost;