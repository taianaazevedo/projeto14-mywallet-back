import express from "express"
import cors from "cors"
import joi from "joi"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"

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

const usuarioCadastradoSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required()
});


app.post("/", async (req, res) => {
    const { email, password } = req.body

    try {
       const usuarioLogado = await db.collection("usuarios").findOne({ email })

       if(!usuarioLogado) return res.status(400).send("Usuário ou senha incorretos")

       const verificaSenha = bcrypt.compareSync(password, usuarioLogado.password)

       if (!verificaSenha) return res.status(400).send("Usuário ou senha incorretos")

       const token = uuidV4()

       await db.collection("sessoes").insertOne({idUsuario: usuarioLogado._id, token})

       return res.status(200).send(token)

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})




app.post("/cadastro", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body

    const { error } = usuarioCadastradoSchema.validate({ name, email, password, confirmPassword }, { abortEarly: false })

    if (error) {
        const errorMessage = error.details.map(err => err.message)
        return res.status(422).send(errorMessage)
    }

    const hashPassword = bcrypt.hashSync(password, 10)

    try {
        const usuarioExiste = await db.collection("usuarios").find({ email })

        if (usuarioExiste) return res.status(401).send("E-mail já cadastrado")

        await db.collection("usuarios").insertOne({ name, email, password: hashPassword })

        res.status(201).send("Usuário criado!")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)
    }
})

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`))