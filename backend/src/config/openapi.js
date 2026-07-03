import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API',
      version: '1.0.0',
      description: 'REST API for the Order Management application.',
    },
    servers: [
      { url: '/api', description: 'API base (relative to docs host)' },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB document ID' },
            title: { type: 'string' },
            status: { type: 'string', enum: ['active', 'complete'] },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const spec = swaggerJsdoc(options);
