import { Router } from "express";
import { home } from "../controllers/carteiraController.js";
import { novaEntrada } from "../controllers/carteiraController.js";
import { novaSaida } from "../controllers/carteiraController.js";
import { lancamentosSchema } from "../schema/carteiraSchema.js"
import validacaoSchema from "../middlewares/validacaoSchema.js";

const carteira = Router()


carteira.get("/home", home)
carteira.post("/nova-entrada", validacaoSchema(lancamentosSchema), novaEntrada)
carteira.post("/nova-saida", validacaoSchema(lancamentosSchema), novaSaida)

export default carteira