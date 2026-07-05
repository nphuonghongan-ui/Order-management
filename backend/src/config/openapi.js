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
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refresh_token',
          description: 'httpOnly refresh-token cookie (rotation handled server-side)',
        },
      },
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
        AccountPublic: {
          type: 'object',
          properties: {
            customerCustId: { type: 'string' },
            userName: { type: 'string' },
            role: { type: 'string', enum: ['PO', 'Sale', 'Manufacture'] },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['userName', 'password'],
          properties: {
            userName: { type: 'string' },
            password: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            account: { $ref: '#/components/schemas/AccountPublic' },
            accessToken: {
              type: 'string',
              description: 'Short-lived JWT; send as Authorization: Bearer <accessToken>',
            },
          },
        },
        LineItemRequest: {
          type: 'object',
          required: ['poNum', 'shipToNum', 'needByDate', 'requestDate', 'mode', 'orderDtl', 'unitPrice', 'quantityPerCont'],
          properties: {
            poNum: { type: 'string' },
            shipToNum: { type: 'string' },
            needByDate: { type: 'string', format: 'date' },
            requestDate: { type: 'string', format: 'date' },
            mode: { type: 'string', enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
            orderDtl: {
              type: 'object',
              required: ['orderLine', 'partNum', 'sellingQuantity'],
              properties: {
                orderLine: { type: 'integer', minimum: 1 },
                partNum: { type: 'string' },
                sellingQuantity: { type: 'integer', minimum: 1 },
              },
            },
            unitPrice: { type: 'number', minimum: 0 },
            quantityPerCont: { type: 'integer', minimum: 1 },
          },
        },
        CreatePORequest: {
          type: 'object',
          required: ['lines'],
          properties: {
            lines: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/LineItemRequest' },
            },
          },
        },
        POLinePublic: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            customerCustId: { type: 'string' },
            poNum: { type: 'string' },
            shipToNum: { type: 'string' },
            needByDate: { type: 'string', format: 'date-time' },
            requestDate: { type: 'string', format: 'date-time' },
            mode: { type: 'string', enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
            orderDtl: {
              type: 'object',
              properties: {
                orderLine: { type: 'integer' },
                partNum: { type: 'string' },
                sellingQuantity: { type: 'integer' },
              },
            },
            unitPrice: { type: 'number' },
            total: { type: 'number' },
            quantityPerCont: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePOResponse: {
          type: 'object',
          properties: {
            created: {
              type: 'array',
              items: { $ref: '#/components/schemas/POLinePublic' },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const spec = swaggerJsdoc(options);
