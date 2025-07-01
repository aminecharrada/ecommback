const router = require("express").Router();

const adminController = require("../controllers/adminController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");

const auth = require("../middleware/Auth");

router.route("/auth").post(adminController.sendCurrentUser);

// register new admin
router
  .route("/register")
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("admin"),
    adminController.registerAdmin
  );

// login admin
router.route("/login").post(adminController.loginAdmin);

// logout admin
router.route("/logout").get(adminController.logoutAdmin);

// get all admin details
router
  .route("/users")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("admin", "prestataire"),
    adminController.getAllAdminDetails
  );

// get single admin details
router
  .route("/users/:id")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("admin", "prestataire"),
    adminController.getSingleAdminDetails
  )
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("admin", "prestataire"),
    adminController.updateAdminPrivilege
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("admin", "prestataire"),
    adminController.deleteAdmin
  );

// create a new product
router
  .route("/product/new")
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin"),
    productController.createProduct
  );

// send, update, delete a single product
router
  .route("/product/:id")
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin"),
    productController.updateProduct
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin"),
    productController.deleteProduct
  );

// delete product reviews
router
  .route("/product/review/:id")
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin"),
    productController.deleteReview
  );

// send all orderssupe
router
  .route("/orders")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin", "client"),
    orderController.getAllOrders
  );

// send single order
router
  .route("/order/:id")
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin", "client"),
    orderController.updateOrderStatus
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("prestataire", "admin"),
    orderController.deleteOrder
  );

module.exports = router;
