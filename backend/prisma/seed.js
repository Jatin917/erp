import { seedFieldRegistry } from "../src/registry/seed/seed-field-registry.js";
import { syncCustomFieldsToRegistry } from "../src/registry/seed/sync-custom-fields.js";
const run = async () => {
    await seedFieldRegistry();
    await syncCustomFieldsToRegistry();
    console.log("Field registry seed completed");
};
run().catch((error) => {
    console.error("Field registry seed failed", error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map