const Joi = require('joi');

const schemaUsuario = Joi.object({
    nome: Joi.string().min(3).max(50).required().messages({
        "string.empty": 'O nome é obrigatório',
        "string.min": 'O nome deve conter pelo menos 3 caracteres',
        "string.max": 'O nome deve conter no máximo 50 caracteres',
        "any.required": 'O nome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
        "string.empty": 'O email é obrigatório',
        "string.email": 'O email deve ser válido',
        "any.required": 'O email é obrigatório'
    }),
    senha: Joi.string().min(6).required().messages({
        "string.empty": 'A senha é obrigatória',
        "string.min": 'A senha deve conter pelo menos 6 caracteres',
        "any.required": 'A senha é obrigatória'
    })
});

function validarUsuario(req, res, next) {
    const { error } = schemaUsuario.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ erro: error.details.map(e => e.message) });
    }
    next();
}

module.exports =  validarUsuario;