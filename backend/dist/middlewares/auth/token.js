import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { JWT_SECRET, prisma } from "@src/server.js";
import jwt from "jsonwebtoken";
export const TokenCheck = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];
        console.log("token ", token);
        // verify token
        const decodedData = jwt.verify(token, JWT_SECRET);
        // check if user exists in DB
        const user = await prisma.user.findFirst({
            where: { id: decodedData.userId },
        });
        if (!user) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ success: false, message: "User not found" });
        }
        // attach user to request
        // req.body = {...req.body, createdBy:user.email};
        req.user = user;
        next();
    }
    catch (error) {
        console.error("TokenCheck error:", error);
        return res
            .status(HTTP_STATUS.UNAUTHORIZED)
            .json({ success: false, message: "Invalid or expired token" });
    }
};
//# sourceMappingURL=token.js.map