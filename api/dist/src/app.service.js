"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = AppService_1 = class AppService {
    constructor() {
        this.logger = new common_1.Logger(AppService_1.name);
    }
    getHello() {
        try {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Go Serverless v4.0! Your function executed successfully!'
                })
            };
        }
        catch (error) {
            this.logger.error(`Error in getHello: ${error.message}`, error.stack);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error',
                    error: error.message
                })
            };
        }
    }
    getTest() {
        try {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'This is a test endpoint',
                    timestamp: new Date().toISOString()
                })
            };
        }
        catch (error) {
            this.logger.error(`Error in getTest: ${error.message}`, error.stack);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error',
                    error: error.message
                })
            };
        }
    }
    getStatus() {
        console.log('status');
        try {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: 'healthy',
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString()
                })
            };
        }
        catch (error) {
            this.logger.error(`Error in getStatus: ${error.message}`, error.stack);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error',
                    error: error.message
                })
            };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map