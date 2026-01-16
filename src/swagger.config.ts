import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dessert Shop API',
      version: '1.0.0',
      description: 'API documentation for Tasks 0-5',
    },
    servers: [
  { url: 'http://localhost:3000' },
  { url: 'https://links-frzr.onrender.com' }
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
  },
  // This glob pattern finds documentation in all controller files
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);