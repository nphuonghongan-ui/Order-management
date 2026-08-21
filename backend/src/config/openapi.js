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
          name: '__Host-om_refresh',
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
            authProvider: { type: 'string', enum: ['local', 'google', 'both'] },
            email: { type: 'string', nullable: true },
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
                sellingQuantity: {
                  type: 'integer',
                  minimum: 1,
                  description:
                    'Original ordered quantity on PO create. Decrements as PackingLists are submitted for this line, becoming the remaining quantity to pack.',
                },
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
                sellingQuantity: {
                  type: 'integer',
                  minimum: 0,
                  description:
                    'Remaining quantity to pack for this line. Equals the original ordered quantity minus the sum of qty across all PackingLists for this line.',
                },
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
        OrderPublic: {
          allOf: [
            { $ref: '#/components/schemas/POLinePublic' },
            {
              type: 'object',
              properties: {
                exWorkDate: { type: 'string', format: 'date-time', nullable: true },
                packedQty: {
                  type: 'integer',
                  minimum: 0,
                  description:
                    'Sum of qty for this line already included in PackingLists. Only populated when excludePacked=true (Sale-side picker); otherwise omitted/0.',
                },
              },
            },
          ],
        },
        OrderExWorkPatch: {
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
        OrderListResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderPublic' },
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
              description: 'MongoDB _id of the source Order document this line references.',
            },
            poNum: { type: 'string' },
            partNum: { type: 'string' },
            shipToNum: { type: 'string' },
            mode: { type: 'string', enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
            qty: { type: 'integer', minimum: 1 },
            unitPrice: { type: 'number', minimum: 0 },
            currentSellingQty: {
              type: 'integer',
              minimum: 0,
              description:
                'The source Order\'s current `orderDtl.sellingQuantity` at read time (i.e. remaining qty to pack for this line, before this PL\'s qty is added back). Lets the UI compute the per-item max for qty edits.',
            },
            length: {
              type: 'number',
              minimum: 0,
              description: 'cm — denormalized from the PartNum at read time.',
            },
            width: {
              type: 'number',
              minimum: 0,
              description: 'cm — denormalized from the PartNum at read time.',
            },
            height: {
              type: 'number',
              minimum: 0,
              description: 'cm — denormalized from the PartNum at read time.',
            },
            weightKg: {
              type: 'number',
              minimum: 0,
              description: 'kg (per piece) — denormalized from the PartNum at read time.',
            },
            cbm: {
              type: 'number',
              minimum: 0,
              description: 'm³ — computed: (length × width × height × qty) / 1,000,000.',
            },
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
        PackingListOperation: {
          oneOf: [
            {
              type: 'object',
              required: ['op', 'lineId', 'qty'],
              properties: {
                op: { type: 'string', enum: ['set_qty'] },
                lineId: { type: 'string' },
                qty: { type: 'integer', minimum: 1 },
              },
            },
            {
              type: 'object',
              required: ['op', 'name', 'address'],
              properties: {
                op: { type: 'string', enum: ['set_customer'] },
                name: { type: 'string' },
                address: { type: 'string' },
                contact: { type: 'string' },
                email: { type: 'string', format: 'email' },
              },
            },
            {
              type: 'object',
              required: ['op', 'name', 'address'],
              properties: {
                op: { type: 'string', enum: ['set_delivery'] },
                name: { type: 'string' },
                address: { type: 'string' },
                shipDate: { type: 'string', format: 'date', nullable: true },
                notes: { type: 'string' },
              },
            },
          ],
        },
        UpdatePackingListRequest: {
          type: 'object',
          required: ['operations'],
          properties: {
            operations: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/PackingListOperation' },
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
                length: { type: 'number', minimum: 0, description: 'cm' },
                width: { type: 'number', minimum: 0, description: 'cm' },
                height: { type: 'number', minimum: 0, description: 'cm' },
              },
            },
            weightKg: { type: 'number', minimum: 0, description: 'kg (per piece)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PartNumListResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/PartNumPublic' },
            },
            nextCursor: {
              type: 'string',
              nullable: true,
              description: 'Opaque cursor for the next page; null when there are no more results.',
            },
            hasMore: {
              type: 'boolean',
              description: 'True when more rows exist beyond the current page.',
            },
          },
        },
        CreatePartNumRequest: {
          type: 'object',
          required: ['partNum', 'dimension'],
          properties: {
            no: { type: 'integer', minimum: 1, description: 'Optional. Auto-assigned as max(no)+1 when omitted.' },
            partNum: { type: 'string', description: 'Trimmed and uppercased server-side; must be unique.' },
            dimension: {
              type: 'object',
              required: ['length', 'width', 'height'],
              properties: {
                length: { type: 'number', minimum: 0, description: 'cm' },
                width: { type: 'number', minimum: 0, description: 'cm' },
                height: { type: 'number', minimum: 0, description: 'cm' },
              },
            },
            weightKg: { type: 'number', minimum: 0, default: 0, description: 'kg per piece.' },
          },
        },
        ImportPartNumRow: {
          type: 'object',
          required: ['partNum', 'dimension'],
          properties: {
            no: { type: 'integer', minimum: 1 },
            partNum: { type: 'string' },
            dimension: {
              type: 'object',
              required: ['length', 'width', 'height'],
              properties: {
                length: { type: 'number', minimum: 0 },
                width: { type: 'number', minimum: 0 },
                height: { type: 'number', minimum: 0 },
              },
            },
            weightKg: { type: 'number', minimum: 0 },
          },
        },
        ImportPartNumRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              maxItems: 1000,
              items: { $ref: '#/components/schemas/ImportPartNumRow' },
            },
          },
        },
        ImportPartNumError: {
          type: 'object',
          properties: {
            row: { type: 'integer', description: '1-based row index in the submitted array.' },
            partNum: { type: 'string', nullable: true },
            message: { type: 'string' },
          },
        },
        ImportPartNumResponse: {
          type: 'object',
          properties: {
            createdCount: { type: 'integer', minimum: 0 },
            skippedCount: { type: 'integer', minimum: 0 },
            created: {
              type: 'array',
              items: { $ref: '#/components/schemas/PartNumPublic' },
            },
            errors: {
              type: 'array',
              items: { $ref: '#/components/schemas/ImportPartNumError' },
            },
          },
        },
        ContainerPublic: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            typeId: { type: 'string', enum: ['20GP', '40GP', '40HC', '45HC'] },
            isoDesignation: { type: 'string', nullable: true },
            label: { type: 'string' },
            inner: {
              type: 'object',
              properties: {
                length: { type: 'number', minimum: 0, description: 'cm' },
                width: { type: 'number', minimum: 0, description: 'cm' },
                height: { type: 'number', minimum: 0, description: 'cm' },
              },
            },
            maxWeightKg: { type: 'number', minimum: 0 },
            shellColor: { type: 'string' },
            costFactor: { type: 'number', minimum: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClpBoxPlacement: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            partNum: { type: 'string' },
            poNum: { type: 'string' },
            size: {
              type: 'object',
              properties: {
                l: { type: 'number', minimum: 0, description: 'mm' },
                w: { type: 'number', minimum: 0, description: 'mm' },
                h: { type: 'number', minimum: 0, description: 'mm' },
              },
            },
            position: {
              type: 'object',
              properties: {
                x: { type: 'number', minimum: 0, description: 'mm' },
                y: { type: 'number', minimum: 0, description: 'mm' },
                z: { type: 'number', minimum: 0, description: 'mm' },
              },
            },
            rotationY: { type: 'number' },
            weightKg: { type: 'number', minimum: 0 },
            qty: { type: 'integer', minimum: 1 },
            color: { type: 'string' },
          },
        },
        ClpStats: {
          type: 'object',
          properties: {
            fillPct: { type: 'number', minimum: 0, maximum: 100 },
            weightKg: { type: 'number', minimum: 0 },
            itemCount: { type: 'integer', minimum: 0 },
            volumeMm3: { type: 'number', minimum: 0 },
            usedVolumeMm3: { type: 'number', minimum: 0 },
          },
        },
        ClpOptimizeRequest: {
          type: 'object',
          required: ['plId', 'containerTypeId'],
          properties: {
            plId: { type: 'string' },
            containerTypeId: {
              type: 'string',
              enum: ['20GP', '40GP', '40HC', '45HC'],
            },
          },
        },
        ClpOptimizeResponse: {
          type: 'object',
          properties: {
            containerTypeId: { type: 'string' },
            placements: {
              type: 'array',
              items: { $ref: '#/components/schemas/ClpBoxPlacement' },
            },
            stats: { $ref: '#/components/schemas/ClpStats' },
            skippedPartNums: {
              type: 'array',
              items: { type: 'string' },
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
