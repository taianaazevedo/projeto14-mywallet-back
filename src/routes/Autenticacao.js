import { Router } from "express";
import { login, cadastro } from "../controllers/autenticacaoController.js"
import { usuarioCadastradoSchema, loginSchema } from "../schema/autenticacaoSchema.js";
import validacaoSchema from "../middlewares/validacaoSchema.js";

const autenticacao = Router()

autenticacao.post("/", validacaoSchema(loginSchema), login)
autenticacao.post("/cadastro", validacaoSchema(usuarioCadastradoSchema), cadastro)

export default autenticacao