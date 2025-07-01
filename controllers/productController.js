const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");
const cloudinary = require("../config/cloudinary");
const connect = require("../config/DataBase");
var pool;
var connection;
var categorys;
ConnectToDb();
// create a new product
exports.createProduct = catchAsyncError(async (req, res, next) => {
// console.log(req.body);
  req.body.admin = req.user.id;
  const { name, description, stock, price, uidCategory } = req.body;
  let images = req.body.images;
  let newImages = [];
  for (let i = 0; i < images.length; i++) {
    const { public_id, url } = await cloudinary.uploader.upload(images[i], {
      folder: "tomper-wear",
    });
    newImages.push({ public_id, url });
  }
  req.body.images = [...newImages];
  categorys = await getData(req);
// Now you can use await with the wrapped function
// try {
//   ConnectPool.query("SELECT * FROM category", (error, results) => {
//     if (error) {
//       reject(error);
//     } else {
//       resolve(results);
//     }
//   });  
// } catch (error) {
//   console.error(error);
// }
  /////////////////////
  // console.log(req.body.category);
  // const categories = await conn.query(
  //   "SELECT * FROM category WHERE category = ?",
  //   [req.body.category],
  //   (error, results) => {
  //     if (error) throw error;
  //     console.log(results);
  //   }
  // );

  if (categorys[0].length != 0) {
   
    
    await connection.query(
      "INSERT INTO products (nameProduct, description, codeProduct, stock, price, picture, category_id) VALUE (?,?,?,?,?,?,?)",
      [
        name,
        description,
        "000" + name,
        stock,
        price,
        newImages[0].url, 
        categorys[0][0].uidCategory,
      ],
      (error, results) => {
        if (error) throw error;
         console.log(error);
      }
    );
  }
  
  // await connectDBMobile.query(
  //   "INSERT INTO Products (nameProduct, description, codeProduct, stock, price, picture, category_id) VALUE (?,?,?,?,?,?,?)",
  //   [
  //     name,
  //     description,
  //     "000" + name,
  //     stock,
  //     price,
  //     req.file.filename,
  //     uidCategory,
  //   ]
  // );

  const product = await Product.create(req.body);
  res.status(200).json({
    success: true,
    data: product,
  });

});

async function ConnectToDb() {
  try {
     pool = await connect();
     connection = await pool.getConnection();
    
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}
const getData = async (req) => {
  try {
   const categorys = await connection.query(
      "SELECT * FROM category WHERE category = ?",
      [req.body.category],
      (error, results) => {
        if (error) throw error;
        console.log(results);
      })
  //  connection.release(); // Release the connection back to the pool
  //  pool.end(); // Close the connection pool when done
   return categorys;
 } catch (error) {
   console.error("Error connecting to the database:", error);
 }
};

// const InsertDataToDbMobil = async () => {
//   try {
//    const categorys = await connection.query("SELECT * FROM category");
//   //  connection.release(); // Release the connection back to the pool
//   //  pool.end(); // Close the connection pool when done
//    return categorys;
//  } catch (error) {
//    console.error("Error connecting to the database:", error);
//  }
// };

// const createProductTOMobile = async (body) => {
//   try {
//     const { name, description, stock, price, uidCategory } = req.body;

//     await connectDBMobile.query(
//       "INSERT INTO Products (nameProduct, description, codeProduct, stock, price, picture, category_id) VALUE (?,?,?,?,?,?,?)",
//       [
//         name,
//         description,
//         "000" + name,
//         stock,
//         price,
//         req.file.filename,
//         uidCategory,
//       ]
//     );
//   } catch (err) {}
// };
// update an existing product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Product Not Found", 400));
  }
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 200));
  }
  let images = req.body.images;
  let newImages = [];
  for (let i = 0; i < images.length; i++) {
    if (typeof images[i] === "string") {
      const { public_id, url } = await cloudinary.uploader.upload(images[i], {
        folder: "tomper-wear",
      });
      newImages.push({ public_id, url });
    } else {
      newImages.push(images[i]);
    }
  }
  req.body.images = [...newImages];
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

// delete an existing product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  // console.log(req.body);
  // req.body.admin = req.user.id;
  // const  codeProductt = req.body;
  // productt =await getData(req);
  if (!req.params.id) {
    return next(new ErrorHandler("Product Not Found", 400));
  }
  const product = await Product.findById(req.params.id);
  // code = await getData(req);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 200));
  }
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }
  await product.remove();
  await connection.query(
    "DELETE FROM products WHERE nameProduct = ?",
    [product.name],
    (error, results) => {
      if (error) throw error;
      console.log(results);
    }
  );
  
  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
});

// send all product details
exports.getAllProducts = catchAsyncError(async (req, res) => {
  console.log(req.headers.isadmin);
  var products ;
 if(req.headers.isadmin != 'true'){
  if (req.headers.access_id != null){
    products= await Product.find({ admin: req.headers.access_id  })
    
  }
 }else if (req.headers.isadmin == 'true'){
  products = await Product.find();
 }

  const data = products.map((item, index) => {
    const {
      _id: id,
      name,
      price,
      images,
      colors,
      ShopName,
      description,
      category,
      stock,
      shipping,
      featured,
    } = item;
    const newItem = {
      id,
      name,
      price,
      image: images[0].url,
      colors,
      ShopName,
      description,
      category,
      stock,
      shipping,
      featured,
    };
    return newItem;
  });
  res.status(200).json({
    success: true,
    data,
  });
});

exports.getAllProductsFromClient = catchAsyncError(async (req, res) => {
  var products ;
  products = await Product.find();

  const data = products.map((item, index) => {
    const {
      _id: id,
      name,
      price,
      images,
      colors,
      ShopName,
      description,
      category,
      stock,
      shipping,
      featured,
    } = item;
    const newItem = {
      id,
      name,
      price,
      image: images[0].url,
      colors,
      ShopName,
      description,
      category,
      stock,
      shipping,
      featured,
    };
    return newItem;
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// exports.getAllProducts = catchAsyncError(async (req, res) => {
//   const userId = req.user.id; // Assuming you have user authentication and can access the user ID

//   // Find the shop associated with the user
//   const shop = await Shop.findOne({ user: userId });

//   // Fetch the products for the shop using the shop name
//   const products = await Product.find({ ShopName: shop.name });

//   const data = products.map((item, index) => {
//     const {
//       _id: id,
//       name,
//       price,
//       images,
//       colors,
//       description,
//       category,
//       stock,
//       shipping,
//       featured,
//     } = item;
//     const newItem = {
//       id,
//       name,
//       price,
//       image: images[0].url,
//       colors,
//       ShopName: shop.name, // Add the shop name to the product
//       description,
//       category,
//       stock,
//       shipping,
//       featured,
//     };
//     return newItem;
//   });

//   res.status(200).json({
//     success: true,
//     data,
//   });
// });

// exports.getAllProducts = catchAsyncError(async (req, res) => {
//   const prestataireId = req.query.prestataireId; // Assuming the prestataire ID is passed as a query parameter
//   console.log(prestataireId);
//   const products = await Product.find({ prestataireId });
//   const data = products.map((item, index) => {
//     const {
//       _id: id,
//       name,
//       price,
//       images,
//       colors,
//       ShopName,
//       description,
//       category,
//       stock,
//       shipping,
//       featured,
//     } = item;
//     const newItem = {
//       id,
//       name,
//       price,
//       image: images[0].url,
//       colors,
//       ShopName,
//       description,
//       category,
//       stock,
//       shipping,
//       featured,
//     };
//     return newItem;
//   });
//   res.status(200).json({
//     success: true,
//     data,
//   });
// });

// send only a single product detaisl
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  console.log(req.params.id);
  if (!req.params.id) {
    return next(new ErrorHandler("Product Not Found", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product Not Found", 200));
  }
  res.status(200).json({
    success: true,
    data: product,
  });
});

// exports.getPrestataireProducts = catchAsyncError(async (req, res) => {
//   const prestataireId = req.user.id; // Assuming the prestataire's user ID is stored in req.user.id
//   const products = await Product.find({ prestataire: prestataireId });
//   const data = products.map((item) => {
//     const {
//       _id: id,
//       name,
//       price,
//       images,
//       colors,
//       ShopName,
//       description,
//       category,
//       stock,
//       shipping,
//       featured,
//     } = item;
//     const newItem = {
//       id,
//       name,
//       price,
//       image: images[0].url,
//       colors,
//       ShopName,
//       description,
//       category,
//       stock,
//       shipping,
//       featured,
//     };
//     return newItem;
//   });
//   res.status(200).json({
//     success: true,
//     data,
//   });
// });


// review a product
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId, name, email } = req.body;
  if (!rating || !comment || !productId || !name || !email) {
    return next(new ErrorHandler("Request invalid", 400));
  }
  // creating a review
  const review = {
    name,
    email,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  // check if the user already reviewed
  const isReviewed = product.reviews.some((rev) => rev.email === email);
  // user already review: update the review
  // user gives new review: add new review and update the number of reviews
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  // update product rating
  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / product.reviews.length;
  product.rating = avg;
  // save the product
  await product.save({ validateBeforeSave: false });
  // send success response
  res.status(200).json({
    success: true,
    message: "Product review created",
  });
});

// send all product reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Product not found", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 200));
  }
  const reviews = product.reviews;
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// delete product review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  console.log("================================Delete");
  if (!req.params.id) {
    return next(new ErrorHandler("Product not found", 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler("Review not found", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 200));
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / reviews.length;
  const rating = avg || 0;
  const numberOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.params.id,
    {
      rating,
      numberOfReviews,
      reviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "Review deleted",
  });
});
