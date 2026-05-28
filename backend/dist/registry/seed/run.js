import "dotenv/config";
import { prismaClient } from "../../lib/prisma-client.js";
import { seedFieldRegistry } from "./seed-field-registry.js";
import { syncCustomFieldsToRegistry } from "./sync-custom-fields.js";
const run = async () => {
    await seedFieldRegistry();
    await syncCustomFieldsToRegistry();
    console.log("Field registry seed completed");
};
run()
    .catch((error) => {
    console.error("Field registry seed failed", error);
    process.exit(1);
})
    .finally(async () => {
    await prismaClient.$disconnect();
});
//# sourceMappingURL=run.js.map