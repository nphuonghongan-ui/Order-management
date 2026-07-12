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
          required: ['poNum', 'shipToNum', 'needByDate', 'requestDate', 'mode', 'orderDtl', 'unitPrice'],
          properties: {
            poNum: {
              type: 'string',
              description: 'PO identifier shared across all line items belonging to the same purchase order.',
            },
            shipToNum: { type: 'string' },
            needByDate: { type: 'string', format: 'date' },
            requestDate: { type: 'string', format: 'date' },
            mode: { type: 'string', enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
            orderDtl: {
              type: 'object',
              required: ['orderLine', 'partNum', 'sellingQuantity'],
              properties: {
                orderLine: {
                  type: 'integer',
                  minimum: 1,
                  description: 'Distinguishes line items within the same PO. Unique together with poNum per account.',
                },
                partNum: {
                  type: 'string',
                  description: 'Must be a known part number (must exist in the part_nums collection).',
                },
                sellingQuantity: { type: 'integer', minimum: 1 },
              },
            },
            unitPrice: { type: 'number', minimum: 0 },
             quantityPerCont: { type: 'integer', minimum: 0 },
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
        ItemPublic: {
          allOf: [
            { $ref: '#/components/schemas/POLinePublic' },
            {
              type: 'object',
              properties: {
                exWorkDate: { type: 'string', format: 'date-time', nullable: true },
              },
            },
          ],
        },
        ItemExWorkPatch: {
          type: 'object',
          required: ['exWorkDate'],
          properties: {
            exWorkDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'ISO date string (YYYY-MM-DD) to set, or null to clear.',
            },
          },
        },
        ItemListResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/ItemPublic' },
            },
          },
        },
        PackingListCustomer: {
          type: 'object',
          required: ['name', 'address'],
          properties: {
            name: { type: 'string', description: 'Company / customer name.' },
            address: { type: 'string' },
            contact: { type: 'string', description: 'Optional contact person name.' },
            email: { type: 'string', format: 'email', description: 'Optional contact email.' },
          },
        },
        PackingListDelivery: {
          type: 'object',
          required: ['name', 'address'],
          properties: {
            name: { type: 'string', description: 'Recipient name at the delivery location.' },
            address: { type: 'string', description: 'Full delivery address including postal code.' },
            shipDate: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expected delivery date as ISO yyyy-mm-dd, or null/empty when unspecified.',
            },
            notes: { type: 'string', description: 'Optional delivery instructions (incoterms, port of entry, etc.).' },
          },
        },
        PackingListItem: {
          type: 'object',
          required: ['lineId', 'poNum', 'partNum', 'shipToNum', 'mode', 'qty', 'unitPrice'],
          properties: {
            lineId: {
              type: 'string',
              description: 'MongoDB _id of the source Item document this line references.',
            },
            poNum: { type: 'string' },
            partNum: { type: 'string' },
            shipToNum: { type: 'string' },
            mode: { type: 'string', enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
            qty: { type: 'integer', minimum: 1 },
            unitPrice: { type: 'number', minimum: 0 },
          },
        },
        PackingListPublic: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'MongoDB document ID.' },
            plNumber: {
              type: 'string',
              description: 'Server-generated in the format `PL-{customerCustId}-{ms-timestamp}`.',
              example: 'PL-DYL-1736543212123',
            },
            customer: { $ref: '#/components/schemas/PackingListCustomer' },
            delivery: { $ref: '#/components/schemas/PackingListDelivery' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/PackingListItem' },
            },
            itemsCount: { type: 'integer', minimum: 1, description: 'Server-computed `items.length`.' },
            total: {
              type: 'number',
              minimum: 0,
              description: 'Server-computed `sum(qty * unitPrice)`.',
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SubmitPackingListRequest: {
          type: 'object',
          required: ['customer', 'delivery', 'items'],
          properties: {
            customer: { $ref: '#/components/schemas/PackingListCustomer' },
            delivery: { $ref: '#/components/schemas/PackingListDelivery' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/PackingListItem' },
            },
          },
        },
        PartNumPublic: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            no: { type: 'integer', minimum: 1 },
            partNum: { type: 'string' },
            dimension: {
              type: 'object',
              properties: {
                length: { type: 'number', minimum: 0 },
                width: { type: 'number', minimum: 0 },
                height: { type: 'number', minimum: 0 },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const spec = swaggerJsdoc(options);
