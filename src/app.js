import express from "express"
import cors from "cors"
import autenticacao from "./routes/Autenticacao.js"
import carteira from "./routes/Carteira.js"


const app = express()
app.use(express.json())
app.use(cors())


app.use([autenticacao, carteira])


const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`))