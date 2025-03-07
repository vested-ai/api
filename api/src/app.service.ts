import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): any {
    try {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Go Serverless v4.0! Your function executed successfully!'
          })
        };
      } catch (error) {
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

  getTest(): any {
    try {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'This is a test endpoint',
          timestamp: new Date().toISOString()
        })
      };
    } catch (error) {
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

  getStatus(): any {
    console.log('status')
    try {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        })
      };
    } catch (error) {
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
} 