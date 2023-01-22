import {db} from "../db/db.js"
import dayjs from "dayjs"



export const novaEntrada = (async (req, res) => {
    const value = res.locals.value
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")

    try {
        const checaUsuarioOnline = await db.collection("sessoes").findOne({ token })

        if (!checaUsuarioOnline) return res.status(401).send("Você não tem autorização para cadastrar uma nova entrada")

        await db.collection("carteira").insertOne({ valor: value.valor, tipo: "entrada", descricao: value.descricao, dia: dayjs().format("DD/MM"), idUsuario: checaUsuarioOnline.idUsuario })

        res.status(201).send("Nova entrada cadastrada")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})

export const novaSaida = (async (req, res) => {
    const value = res.locals.value
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")


    try {
        const checaUsuarioOnline = await db.collection("sessoes").findOne({ token })

        if (!checaUsuarioOnline) return res.status(401).send("Você não tem autorização para cadastrar uma nova saída")

        await db.collection("carteira").insertOne({ valor: value.valor, tipo: "saida", descricao: value.descricao, dia: dayjs().format("DD/MM"), idUsuario: checaUsuarioOnline.idUsuario })

        res.status(201).send("Nova saída cadastrada")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})


export const home = (async (req, res) => {
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")

    try {

        const checaUsuarioOnline = await db.collection("sessoes").findOne({ token })

        if (!checaUsuarioOnline) return res.status(401).send("Você não tem autorização para acessar à carteira")

        const carteira = await db.collection("carteira").find({ idUsuario: (checaUsuarioOnline.idUsuario) }).toArray()

        if (!carteira) return res.sendStatus(401)

        return res.send(carteira)


    } catch (error) {
        res.sendStatus(500)
        console.log(error.message)

    }
})