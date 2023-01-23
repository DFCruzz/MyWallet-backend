import { Router } from "express";
import { newEntry, getEntries } from "../controllers/MyWalletController.js";
import { inputSchema } from "../schema/MyWalletSchema.js";
import validateSchema from "../middlewares/validateSchema.js";

const wallet = Router()

wallet.post("/home", validateSchema(inputSchema), newEntry)
wallet.get("/home", getEntries)

export default wallet