const catchAsyncErrors = require("../middleware/CatchAsyncErrors");
const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");
const { sendToken } = require("../utils/jwt");

exports.registerAdmin = catchAsyncError(async (req, res, next) => {
  console.log(req.body);
  const { name, email, password, privilege } = req.body;
  if (!name || !email || !password) {
    console.log("Missing fields detected");
    return next(new ErrorHandler("Missing fields", 400));
  }
  const admin = await Admin.create({
    name,
    email,
    privilege,
    password,
  });
  console.log("Admin created:", admin);
  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      privilege: admin.privilege,
    },
  });
});
exports.loginAdmin = async (req, res, next) => {
  console.log("Login Request Body:", req.body);
  const { email, password } = req.body;
  
  // console.log('email:', email);
  // console.log('password:', password);

    if (!email || !password) {
      console.log("Login failed: Missing email/password");
      return next(new ErrorHandler('Missing fields', 400));
    }
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.log("Login failed: Admin not found for email:", email);
      return next(new ErrorHandler('Invalid email or password', 401));
    }
    const isPasswordMatched = await admin.comparePassword(password);
    if (!isPasswordMatched) {
      console.log("Login failed: Password mismatch for email:", email);
      return next(new ErrorHandler('Invalid email or password', 401));
    }
    console.log("Login successful for admin ID:", admin._id);
    sendToken(admin, 200, res);
  

  }


// exports.loginAdmin = catchAsyncError(async (req, res, next) => {
//   console.log(req);
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return next(new ErrorHandler("Missing fields", 400));
//   }
//   const admin = await Admin.findOne({ email }).select("+password");
//   if (!admin) {
//     return next(new ErrorHandler("Invalid email or password", 401));
//   }
//   const isPasswordMatched = await admin.comparePassword(password);
//   if (!isPasswordMatched) {
//     return next(new ErrorHandler("Invalid email or password", 401));
//   }

//   sendToken(admin, 200, res);
// });

exports.logoutAdmin = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.getAllAdminDetails = catchAsyncError(async (req, res, next) => {
  const admin = await Admin.find();
  const adminData = admin.map((item) => {
    return {
      id: item._id,
      name: item.name,
      email: item.email,
      privilege: item.privilege,
    };
  });
  res.status(200).json({
    success: true,
    data: adminData,
  });
});

exports.getSingleAdminDetails = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("User not found", 400));
  }
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new ErrorHandler("User not found", 200));
  }
  const adminData = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
  };
  res.status(200).json({
    success: true,
    data: adminData,
  });
});

exports.sendCurrentUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  console.log("Token from cookies:", token); // Log the received token
  if (!token) {
    console.log("No token found in cookies");
    return next(new ErrorHandler("User not found", 400));
  }
  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded Token Data:", decodedData); // Log decoded JWT payload
  const admin = await Admin.findById(decodedData.id);
  if (!admin) {
    console.log("Admin not found for ID:", decodedData.id);
    new ErrorHandler("User not found", 401);
  }
  console.log("Current user fetched:", admin.email);
  sendToken(admin, 200, res);
});

exports.updateAdminPrivilege = catchAsyncError(async (req, res, next) => {
  const { privilege } = req.body;
  if (!req.params.id) {
    return next(new ErrorHandler("User not found", 400));
  }
  if (!privilege) {
    return next(new ErrorHandler("Invalid: no data provided", 400));
  }
  if (!["admin", "prestataire", "client"].includes(privilege)) {
    return next(new ErrorHandler("Invalid: data invalid", 400));
  }
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new ErrorHandler("User not found", 200));
  }
  if (admin.email === req.user.email) {
    return next(new ErrorHandler("Cannot change privilege for self", 400));
  }
  admin.privilege = privilege;
  await admin.save();
  res.status(200).json({
    success: true,
    data: admin,
  });
});

exports.deleteAdmin = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("User not found", 400));
  }
  const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return next(new ErrorHandler("User not found", 200));
    }
  if (admin.email === req.user.email) {
    return next(new ErrorHandler("Cannot delete self", 400));
  }
  await admin.remove();
  res.status(200).json({
    success: true,
    message: "Admin deleted",
  });
});
