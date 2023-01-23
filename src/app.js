import express from "express"
import cors from "cors"
import auth from "./routes/AuthRoutes.js"
import wallet from "./routes/MyWalletRoutes.js"

const server = express()
server.use(express.json())
server.use(cors())

server.use([auth, wallet])



const PORT = 5000
server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta: ${PORT}`)
})