import { Router } from "express";
import { branchRouter } from "./branch/index.js";

export const schoolRouter: Router = Router();

schoolRouter.use("/", branchRouter)

