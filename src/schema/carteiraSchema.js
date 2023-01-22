import joi from "joi"

export const lancamentosSchema = joi.object({
    valor: joi.number().precision(2).required(),
    descricao: joi.string().required()
})

