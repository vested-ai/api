"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const serverless_express_1 = require("@codegenie/serverless-express");
let server;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    const handler = (0, serverless_express_1.default)({ app: expressApp });
    return handler;
}
const handler = async (event, context, callback) => {
    if (!server) {
        server = await bootstrap();
    }
    return server(event, context, callback);
};
exports.handler = handler;
//# sourceMappingURL=handler.js.map