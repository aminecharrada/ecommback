const catchAsyncErrors = require("./CatchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

exports.checkUserAuthentication = catchAsyncErrors(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization 
    && req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new ErrorHandler("Please login again to access this resource", 401)
    );
  }
  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await Admin.findById(decodedData.id);
  if (!user) {
    new ErrorHandler("User not found", 401);
  }
  req.user = user;
  console.log("go to next middleware");
  next();
});

exports.checkAdminPrivileges = (...roles) => {
  return (req, res, next) => {
    // console.log(req.user.privilege);
    // console.log(roles);

    if (!roles.includes(req.user.privilege)) {  
      return next(
        new ErrorHandler(
          `Role: ${req.user.privilege} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};
