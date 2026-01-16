export {};
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65a12f9e8c9b123456789012
 *         username:
 *           type: string
 *           example: keza_kevin
 *         email:
 *           type: string
 *           example: kevin@gmail.com
 *         role:
 *           type: string
 *           example: Customer
 *
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65b23f9e8c9b987654321000
 *         name:
 *           type: string
 *           example: Electronics
 *
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65c45f9e8c9b112233445566
 *         name:
 *           type: string
 *           example: iPhone 15
 *         price:
 *           type: number
 *           example: 1200
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         inStock:
 *           type: boolean
 *           example: true
 *         vendorId:
 *           type: string
 *           example: 65a12f9e8c9b123456789012
 *
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           $ref: '#/components/schemas/Product'
 *         quantity:
 *           type: number
 *           example: 2
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           $ref: '#/components/schemas/Product'
 *         quantity:
 *           type: number
 *           example: 1
 *         price:
 *           type: number
 *           example: 1200
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 65d78f9e8c9b998877665544
 *         userId:
 *           type: string
 *           example: 65a12f9e8c9b123456789012
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         totalPrice:
 *           type: number
 *           example: 2400
 *         createdAt:
 *           type: string
 *           format: date-time
 */
//# sourceMappingURL=schema.d.ts.map