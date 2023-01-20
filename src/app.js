import express from "express"
import cors from "cors"
import joi from "joi"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"
import dayjs from "dayjs"

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
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().required(),
    confirmaSenha: joi.string().valid(joi.ref('senha')).required()
});

const entradaSchema = joi.object({
    valor: joi.number().required(),
    descricao: joi.string().required()
})


const saidaSchema = joi.object({
    valor: joi.number().required(),
    descricao: joi.string().required()
})

app.post("/", async (req, res) => {
    const { email, senha } = req.body

    try {
        const usuarioLogado = await db.collection("usuarios").findOne({ email })

        if (!usuarioLogado) return res.status(400).send("Usuário ou senha incorretos")

        const verificaSenha = bcrypt.compareSync(senha, usuarioLogado.senha)

        if (!verificaSenha) return res.status(400).send("Usuário ou senha incorretos")

        const token = uuidV4()

        await db.collection("sessoes").insertOne({ idUsuario: usuarioLogado._id, token })

        return res.status(200).send(token)

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})


app.post("/cadastro", async (req, res) => {
    const { nome, email, senha, confirmaSenha } = req.body

    const { error } = usuarioCadastradoSchema.validate({ nome, email, senha, confirmaSenha }, { abortEarly: false })

    if (error) {
        const errorMessage = error.details.map(err => err.message)
        return res.status(422).send(errorMessage)
    }

    const hashSenha = bcrypt.hashSync(senha, 10)

    try {
        const usuarioExiste = await db.collection("usuarios").findOne({ email })

        if (usuarioExiste) return res.status(401).send("E-mail já cadastrado")

        await db.collection("usuarios").insertOne({ nome, email, senha: hashSenha })

        res.status(201).send("Usuário criado!")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)
    }
})


app.post("/nova-entrada", async (req, res) => {
    const { valor, descricao } = req.body
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")

    const { error } = entradaSchema.validate({ valor, descricao }, { abortEarly: false })

    if (error) {
        const erroEntrada = error.details.map(err => err.message)
        res.status(422).send(erroEntrada)
    }

    try {
        const checaUsuarioOnline = await db.collection("sessoes").findOne({ token })

        if (!checaUsuarioOnline) return res.status(401).send("Você não tem autorização para cadastrar uma nova entrada")

        await db.collection("carteira").insertOne({ valor, tipo: "entrada", descricao, dia: dayjs().format("DD/MM"), idUsuario: checaUsuarioOnline.idUsuario })

        res.status(201).send("Nova entrada cadastrada")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})

app.post("/nova-saida", async (req, res) => {
    const { valor, descricao } = req.body
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")

    const { error } = saidaSchema.validate({ valor, descricao }, { abortEarly: false })

    if (error) {
        const erroEntrada = error.details.map(err => err.message)
        res.status(422).send(erroEntrada)
    }

    try {
        const checaUsuarioOnline = await db.collection("sessoes").findOne({ token })

        if (!checaUsuarioOnline) return res.status(401).send("Você não tem autorização para cadastrar uma nova saída")

        await db.collection("carteira").insertOne({ valor, tipo: "saida", descricao, dia: dayjs().format("DD/MM"), idUsuario: checaUsuarioOnline.idUsuario })

        res.status(201).send("Nova saída cadastrada")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})


app.get("/home", async (req, res) => {
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")

    try {

        const checaUsuarioOnline = await db.collection("sessoes").findOne({ token })

        if (!checaUsuarioOnline) return res.status(401).send("Você não tem autorização para acessar à carteira")

        const carteira = await db.collection("carteira").find({idUsuario: (checaUsuarioOnline.idUsuario)}).toArray()

        if(!carteira) return res.sendStatus(401)

        return res.send(carteira)


    } catch (error) {
        res.sendStatus(500)
        console.log(error.message)

    }
})

const PORT = 5000
app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`))