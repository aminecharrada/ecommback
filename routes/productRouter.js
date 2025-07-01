const router = require('express').Router();

const productController = require('../controllers/productController');

// send all product detaisl
router.route('/').get(productController.getAllProducts);
router.route('/client').get(productController.getAllProductsFromClient);


// Get prestataire products
// router.route("/products/prestataire").get(productController.getPrestataireProducts);


// send a single product
router.route('/:id').get(productController.getSingleProduct);

// create product review
router.route('/client/reviews').post(productController.createProductReview);

// send all product reviews
router.route('/client/reviews/:id').get(productController.getAllReviews);

module.exports = router;