const Product = require('../models/product');
const Category = require('../models/category')
const productController = require('../controllers/productController');

describe('getProductsOfOutlet', () => {

    // Test that the 'getProductsOfOutlet' function returns a JSON response with status code 200 and an array of products when given a valid outlet id
    it('should return a JSON response with status code 200 and an array of products when given a valid outlet id', async () => {
        // Mock the request object
        const req = {
            query: {
                outletid: '646a5a0a51c3c24655b854e9'
            }
        };

        // Mock the response object
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mock the Product.find() method
        const mockFind = jest.spyOn(Product, 'find');
        mockFind.mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValueOnce([
                {
                    _id: '649bf336db6a5824369b7cdc',
                    category: '649bedcaeb0a2f9c06dc3199',
                    productName: 'Chocolate Krusher',
                    description: 'Chocolate krusher',
                    price: 10,
                    veg: true,
                    productImage: {
                        url: "http://res.cloudinary.com/dokgv4lff/image/upload/v1690099952/ljk4zhlnaonx7cvnqttx.jpg",
                        imageid: "ljk4zhlnaonx7cvnqttx"
                    },
                    variants: [
                        {
                            variantName: "Medium",
                            price: 60
                        }
                    ],
                    inStock: true
                },
                {
                    _id: '649bf336db6a5824369b7cdc',
                    category: '649bedcaeb0a2f9c06dc3199',
                    productName: 'Chocolate Krusher',
                    description: 'Chocolate krusher',
                    price: 10,
                    veg: true,
                    productImage: {
                        url: "http://res.cloudinary.com/dokgv4lff/image/upload/v1690099952/ljk4zhlnaonx7cvnqttx.jpg",
                        imageid: "ljk4zhlnaonx7cvnqttx"
                    },
                    variants: [
                        {
                            variantName: "Medium",
                            price: 60
                        }
                    ],
                    inStock: true
                }
            ])
        }));

        // Call the function
        await productController.getProductsOfOutlet(req, res);

        // Check the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            count: 2,
            products: [
                {
                    _id: '649bf336db6a5824369b7cdc',
                    category: '649bedcaeb0a2f9c06dc3199',
                    productName: 'Chocolate Krusher',
                    description: 'Chocolate krusher',
                    price: 10,
                    veg: true,
                    productImage: {
                        url: "http://res.cloudinary.com/dokgv4lff/image/upload/v1690099952/ljk4zhlnaonx7cvnqttx.jpg",
                        imageid: "ljk4zhlnaonx7cvnqttx"
                    },
                    variants: [
                        {
                            variantName: "Medium",
                            price: 60
                        }
                    ],
                    inStock: true
                },
                {
                    _id: '649bf336db6a5824369b7cdc',
                    category: '649bedcaeb0a2f9c06dc3199',
                    productName: 'Chocolate Krusher',
                    description: 'Chocolate krusher',
                    price: 10,
                    veg: true,
                    productImage: {
                        url: "http://res.cloudinary.com/dokgv4lff/image/upload/v1690099952/ljk4zhlnaonx7cvnqttx.jpg",
                        imageid: "ljk4zhlnaonx7cvnqttx"
                    },
                    variants: [
                        {
                            variantName: "Medium",
                            price: 60
                        }
                    ],
                    inStock: true
                }
            ]
        });

        // Restore the mock
        mockFind.mockRestore();
    });

    describe('getProductsByCategory', () => {

        // Tests that the function returns categoryArray with all categories and their products when categoryName is 'All'
        it('should return categoryArray with all categories and their products when categoryName is "All"', async () => {
            // Mock the request object
            const req = {
                query: {
                    categoryName: 'All',
                    outletid: '12345'
                }
            };

            // Mock the response object
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock the Category.find() method
            Category.find = jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce([
                    {
                        name: 'Category 1',
                        _id: '123',
                        icon: {
                            _id: '456',
                            icon: {
                                url: 'icon1.jpg'
                            }
                        },
                        products: [
                            {
                                name: 'Product 1',
                                _id: '789',
                                category: '123',
                                icon: {
                                    _id: '101112',
                                    icon: {
                                        url: 'icon2.jpg'
                                    }
                                }
                            },
                            {
                                name: 'Product 2',
                                _id: '131415',
                                category: '123',
                                icon: {
                                    _id: '161718',
                                    icon: {
                                        url: 'icon3.jpg'
                                    }
                                }
                            }
                        ]
                    },
                    {
                        name: 'Category 2',
                        _id: '1920',
                        icon: {
                            _id: '2122',
                            icon: {
                                url: 'icon4.jpg'
                            }
                        },
                        products: [
                            {
                                name: 'Product 3',
                                _id: '232425',
                                category: '1920',
                                icon: {
                                    _id: '262728',
                                    icon: {
                                        url: 'icon5.jpg'
                                    }
                                }
                            }
                        ]
                    }
                ])
            });

            // Call the function
            await productController.getProductsByCategory(req, res);

            // Check the response
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                categoryArray: [
                    {
                        category: 'Category 1',
                        categoryid: '123',
                        iconid: '456',
                        iconurl: 'icon1.jpg',
                        products: [
                            {
                                name: 'Product 1',
                                _id: '789',
                                category: '123',
                                icon: {
                                    _id: '101112',
                                    icon: {
                                        url: 'icon2.jpg'
                                    }
                                }
                            },
                            {
                                name: 'Product 2',
                                _id: '131415',
                                category: '123',
                                icon: {
                                    _id: '161718',
                                    icon: {
                                        url: 'icon3.jpg'
                                    }
                                }
                            }
                        ]
                    },
                    {
                        category: 'Category 2',
                        categoryid: '1920',
                        iconid: '2122',
                        iconurl: 'icon4.jpg',
                        products: [
                            {
                                name: 'Product 3',
                                _id: '232425',
                                category: '1920',
                                icon: {
                                    _id: '262728',
                                    icon: {
                                        url: 'icon5.jpg'
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
        });

        // Tests that the function returns categoryArray with products of the specified category when categoryName is not 'All'
        it('should return categoryArray with products of the specified category when categoryName is not "All"', async () => {
            // Mock the request object
            const req = {
                query: {
                    categoryName: 'Category 1',
                    outletid: '12345'
                }
            };

            // Mock the response object
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock the Category.find() method
            Category.find = jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce([
                    {
                        name: 'Category 1',
                        _id: '123',
                        icon: {
                            _id: '456',
                            icon: {
                                url: 'icon1.jpg'
                            }
                        },
                        products: [
                            {
                                name: 'Product 1',
                                _id: '789',
                                category: '123',
                                icon: {
                                    _id: '101112',
                                    icon: {
                                        url: 'icon2.jpg'
                                    }
                                }
                            },
                            {
                                name: 'Product 2',
                                _id: '131415',
                                category: '123',
                                icon: {
                                    _id: '161718',
                                    icon: {
                                        url: 'icon3.jpg'
                                    }
                                }
                            }
                        ]
                    }
                ])
            });

            // Call the function
            await productController.getProductsByCategory(req, res);

            // Check the response
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                categoryArray: [
                    {
                        category: 'Category 1',
                        categoryid: '123',
                        iconid: '456',
                        iconurl: 'icon1.jpg',
                        products: [
                            {
                                name: 'Product 1',
                                _id: '789',
                                category: '123',
                                icon: {
                                    _id: '101112',
                                    icon: {
                                        url: 'icon2.jpg'
                                    }
                                }
                            },
                            {
                                name: 'Product 2',
                                _id: '131415',
                                category: '123',
                                icon: {
                                    _id: '161718',
                                    icon: {
                                        url: 'icon3.jpg'
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
        });

        // Tests that the function populates the icon field of the category's product document
        it('should populate the icon field of the category\'s product document', async () => {
            // Mock the request object
            const req = {
                query: {
                    categoryName: 'All',
                    outletid: '12345'
                }
            };

            // Mock the response object
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            // Mock the Category.find() method
            Category.find = jest.fn().mockReturnValueOnce({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce([
                    {
                        name: 'Category 1',
                        _id: '123',
                        icon: {
                            _id: '456',
                            icon: {
                                url: 'icon1.jpg'
                            }
                        },
                        products: [
                            {
                                name: 'Product 1',
                                _id: '789',
                                category: '123',
                                icon: {
                                    _id: '101112',
                                    icon: {
                                        url: 'icon2.jpg'
                                    }
                                }
                            },
                            {
                                name: 'Product 2',
                                _id: '131415',
                                category: '123',
                                icon: {
                                    _id: '161718',
                                    icon: {
                                        url: 'icon3.jpg'
                                    }
                                }
                            }
                        ]
                    }
                ])
            });

            // Call the function
            await productController.getProductsByCategory(req, res);

            // Check the response
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                categoryArray: [
                    {
                        category: 'Category 1',
                        categoryid: '123',
                        iconid: '456',
                        iconurl: 'icon1.jpg',
                        products: [
                            {
                                name: 'Product 1',
                                _id: '789',
                                category: '123',
                                icon: {
                                    _id: '101112',
                                    icon: {
                                        url: 'icon2.jpg'
                                    }
                                }
                            },
                            {
                                name: 'Product 2',
                                _id: '131415',
                                category: '123',
                                icon: {
                                    _id: '161718',
                                    icon: {
                                        url: 'icon3.jpg'
                                    }
                                }
                            }
                        ]
                    }
                ]
            });
        });
    });

    // Generated by CodiumAI

    describe('getSingleProduct', () => {

        // Returns a 200 status code and the product object when a valid product ID is provided
        it('should return a 200 status code and the product object when a valid product ID is provided', async () => {
            const req = {
                query: {
                    productid: 'validProductID'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Product.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue('productObject')
            });

            await productController.getSingleProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                product: 'productObject'
            });
        });

        // Returns a 404 status code and an error message when an invalid product ID is provided
        it('should return a 404 status code and an error message when an invalid product ID is provided', async () => {
            const req = {
                query: {
                    productid: 'invalidProductID'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Product.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            });

            await productController.getSingleProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "No product found"
            });
        });

        // Returns a 404 status code and an error message when no product is found
        it('should return a 404 status code and an error message when no product is found', async () => {
            const req = {
                query: {
                    productid: 'validProductID'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            Product.find = jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null)
            });

            await productController.getSingleProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: "No product found"
            });
        });

        // The function should populate the category field with the corresponding category object
        it('should populate the category field with the corresponding category object', async () => {
            const req = {
                query: {
                    productid: 'validProductID'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const populateMock = jest.fn().mockReturnThis();
            const execMock = jest.fn().mockResolvedValue('productObject');

            Product.find = jest.fn().mockReturnValue({
                populate: populateMock,
                exec: execMock
            });

            await productController.getSingleProduct(req, res);

            expect(populateMock).toHaveBeenCalledWith('category');
        });

        // The function should populate the icon field of the category object
        it('should populate the icon field of the category object', async () => {
            const req = {
                query: {
                    productid: 'validProductID'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            const populateMock = jest.fn().mockReturnThis();
            const execMock = jest.fn().mockResolvedValue('productObject');

            Product.find = jest.fn().mockReturnValue({
                populate: populateMock,
                exec: execMock
            });

            await productController.getSingleProduct(req, res);

            expect(populateMock).toHaveBeenCalledWith({
                path: 'category',
                populate: {
                    path: 'icon'
                }
            });
        });
    });

    // // Generated by CodiumAI
    // describe('updateProduct', () => {
    //     // Update product with new name, description, price, variants, veg and image
    //     it('should update the product with new name, description, price, variants, veg and image', async () => {
    //         // Mocking dependencies
    //         const req = {
    //             params: {
    //                 productid: '12345'
    //             },
    //             userData: {
    //                 ownerid: '67890'
    //             },
    //             body: {
    //                 productName: 'New Product',
    //                 description: 'New Description',
    //                 price: 9.99,
    //                 variants: '[{"name": "Size", "options": ["S", "M", "L"]}]',
    //                 veg: true
    //             },
    //             files: {
    //                 productImage: {
    //                     tempFilePath: '/path/to/image.jpg'
    //                 }
    //             }
    //         };

    //         const res = {
    //             status: jest.fn().mockReturnThis(),
    //             json: jest.fn()
    //         };

    //         const Owner = require('../models/owner');
    //         const Product = require('../models/product');
    //         const cloudinary = require('cloudinary').v2;

    //         // Mock Owner.find() to return a result
    //         Owner.find = jest.fn().mockResolvedValue([{ _id: '67890' }]);

    //         // Mock Product.find() to return a product
    //         Product.find = jest.fn().mockResolvedValue([{ 
    //             _id: '12345',
    //             productImage: {
    //                 url: 'https://example.com/image.jpg',
    //                 imageid: 'imageid123'
    //             }
    //         }]);

    //         // Mock cloudinary.uploader.destroy() to return success
    //         cloudinary.uploader.destroy = jest.fn().mockImplementation((imageId, callback) => {
    //             callback(null, 'success');
    //         });

    //         // Mock cloudinary.uploader.upload() to return an image
    //         cloudinary.uploader.upload = jest.fn().mockImplementation((filePath, callback) => {
    //             callback(null, { 
    //                 url: 'https://example.com/newimage.jpg',
    //                 public_id: 'newimageid123'
    //             });
    //         });

    //         // Mock Product.updateOne() to return success
    //         Product.updateOne = jest.fn().mockResolvedValue({});

    //         // Call the function
    //         await productController.updateProduct(req, res);

    //         // Assertions
    //         expect(Owner.find).toHaveBeenCalledWith({ _id: '67890' });
    //         expect(Product.find).toHaveBeenCalledWith({ _id: '12345' });
    //         expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('imageid123', expect.any(Function));
    //         expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/path/to/image.jpg', expect.any(Function));
    //         expect(Product.updateOne).toHaveBeenCalledWith({ 
    //             _id: '12345' 
    //         }, {
    //             $set: {
    //                 productName: 'New Product',
    //                 description: 'New Description',
    //                 price: 9.99,
    //                 variants: [{ name: 'Size', options: ['S', 'M', 'L'] }],
    //                 veg: true,
    //                 productImage: {
    //                     url: 'https://example.com/newimage.jpg',
    //                     imageid: 'newimageid123'
    //                 }
    //             }
    //         });
    //         expect(res.status).toHaveBeenCalledWith(200);
    //         expect(res.json).toHaveBeenCalledWith({ message: 'Product updated successfully' });
    //     });
    // });

});
