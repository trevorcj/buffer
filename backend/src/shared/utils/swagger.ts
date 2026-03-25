import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Buffer Backend API',
      version: '1.0.0',
      description: 'Fintech backend API for the Buffer (RoundUp Reserve / Cushion Wallet) hackathon project.',
    },
    servers: [
      {
        url: 'http://localhost:5432',
        description: 'Requested / Render Server',
      },
      {
        url: 'http://localhost:8081',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.ts'], // Scan for API docs in module route files
};

export const swaggerSpec = swaggerJsdoc(options);
