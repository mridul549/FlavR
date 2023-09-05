const productController = require('../controllers/productController')
const Product = require('../models/product')
const cloudinary = require('cloudinary').v2;
jest.mock('../models/product')

describe('Get products', () => { 
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            query: {
                outletid: 'someId'
            }
        };

        mockResponse = {
            status: jest.fn(() => mockResponse),
            json: jest.fn()
        };
    });

    it('Should send a status code of 200 when a product exists', async () => {
        const mockProducts = [
            {
                _id: 'someId',
                category: {},
                productName: 'productName',
                description: 'description',
                price: 100,
                veg: true,
                productImage: 'imageURL',
                variants: [],
                inStock: true
            }
        ];

        // Simplified mocking using only the most important behaviors
        Product.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValueOnce(mockProducts)
        });

        productController.getProductsOfOutlet(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            count: mockProducts.length,
            products: expect.any(Array)  // Here, we're only checking if it's an array, not the exact content
        });
    });
    
})
