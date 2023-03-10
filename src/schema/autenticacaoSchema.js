import joi from "joi"

export const usuarioCadastradoSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().required(),
    confirmaSenha: joi.string().valid(joi.ref('senha')).required()
});

export const loginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required(),
});