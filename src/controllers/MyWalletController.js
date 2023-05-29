import { database } from "../db/db.js";
import dayjs from "dayjs";

export const getEntries = (async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer", "")

    if (!token) return res.status(420).send("informe o token")

    try {
        const isUserLogged = await database.collection("sessions").findOne({ token })

        if (!isUserLogged) {
            return res.send(401).send("Você não está logado!")
        }

        const myWallet = await database.collection("myWallet").find({ userId: isUserLogged.userId }).toArray()

        return res.send(myWallet)

    }
    
    catch (error) {
        res.status(500).send(error.message)
    }    
})


export const newEntry = (async (req, res) => {
    const value = res.locals.value
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", '')

    if (!token) return res.status(422).send("Informe o token!")


    try {
        const isUserLogged = await db.collection("sessions").findOne({ token })

        if (!isUserLogged) return res.status(401).send("Você não está logado!")

        await db.collection("carteira").insertOne({
            value: value.value,
            type: value.type,
            descricao: value.description,
            date: value.date,
            userId: isUserLogged.userId })

        res.status(201).send("Nova saída cadastrada")

    } catch (error) {
        res.sendStatus(500)
        console.log(error)

    }
})


/*export const newEntary = (async (req, res) => {
    const value = res.locals.value
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer", "")


    if (!token) return res.status(420).send("informe o token")

    try {
        const date = dayjs(Date.now()).format("DD/MM")

        const isUserLogged = await database.collection("sessions").findOne({ token })

        if (isUserLogged) {
            return res.send(401).send("Você não está logado!")
        }

        await database.collection("myWallet").insertOne({
            description: value.description,
            value: value.value ,
            type: value.type,
            date: date,
            user: isUserLogged.userId
        })

        res.sendStatus(201)
    }

    catch (error) {
        res.status(500).send(error.message)
    }
})*/