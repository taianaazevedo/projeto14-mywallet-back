import {db} from "../db/db.js"
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"


export const login = (async (req, res) => {
    const { email, senha } = req.body

    try {
        const usuarioLogado = await db.collection("usuarios").findOne({ email })

        if (!usuarioLogado) return res.status(400).send("Usuário ou senha incorretos")

        const verificaSenha = bcrypt.compareSync(senha, usuarioLogado.senha)

        if (!verificaSenha) return res.status(400).send("Usuário ou senha incorretos")

        const token = uuidV4()

        await db.collection("sessoes").insertOne({ idUsuario: usuarioLogado._id, token })

        return res.status(200).send({ usuarioLogado, token })

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})


export const cadastro = (async (req, res) => {
    const { nome, email, senha } = req.body
   
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
