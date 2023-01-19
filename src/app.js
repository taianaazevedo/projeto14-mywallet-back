import express from "express"
import cors from "cors"
import joi from "joi"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const mongoClient = new MongoClient(process.env.DATABASE_URL)

let db

try {
    await mongoClient.connect()
    db = mongoClient.db()
    console.log("MongoDB conectado!")
} catch (error) {
    console.log(error.message)
}

const usuarioLogadoSchema = joi.object({
    nome: joi.string().required(),
    senha: joi.string().required(),
});

app.post("/", async (req, res) => {
    const { email, senha } = req.body

    usuarioLogadoSchema.validate({ email, senha }, { abortEarly: false })
})