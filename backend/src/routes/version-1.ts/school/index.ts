import { Router } from "express";
import { branchRouter } from "./branch/index.js";

export const schoolRouter = Router();

schoolRouter.use("/", branchRouter)

