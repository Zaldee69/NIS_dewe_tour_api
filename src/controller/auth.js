const { user } = require("../../models");

//import package
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  const { fullName, email, gender, phone, address } = req.body;
  const schema = Joi.object({
    fullName: Joi.string().min(5).required(),
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(6).required(),
    address: Joi.string().min(1).required(),
    gender: Joi.string().min(1).required(),
  });

  const { error } = schema.validate(req.body);

  //do validation and get error
  if (error) {
    console.log(error);
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    });
  }

  const userExist = await user.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (userExist) {
    res.status(400).send({
      status: "failed",
      message: "email already exist",
    });
  }

  try {
    //generate salt
    const salt = await bcrypt.genSalt(10);
    //hasing password

    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await user.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
      gender,
      role: "user",
      image: "http://localhost:5000/uploads/blank.png",
    });
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).send({
      status: "success",
      fullName: newUser.fullName,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "server error",
    });
  }
};

exports.userLogin = async (req, res) => {
  //validation schema
  const schema = Joi.object({
    email: Joi.string().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  //do validation adnd get error
  const { error } = schema.validate(req.body);
  console.log(error);

  if (error) {
    console.log(error);
    res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    });
  }
  try {
    const userExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    if (!userExist) {
      return res.status(400).send({
        status: "failed",
        message: "credential is invalid",
      });
    }

    //compare password from client and database
    const isValid = await bcrypt.compare(req.body.password, userExist.password);

    //check password valid or not
    if (!isValid) {
      res.status(400).send({
        status: "failed",
        message: "credential is invalid",
      });
    }

    //generate token
    const token = jwt.sign(
      { id: userExist.id, role: userExist.role },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).send({
      status: "success",
      data: {
        fullName: userExist.fullName,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status: "failed",
      message: "server error",
    });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const id = req.user.id;

    const dataUser = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    console.log(dataUser);

    if (!dataUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    res.send({
      status: "success",
      data: {
        user: {
          id: dataUser.id,
          name: dataUser.fullName,
          email: dataUser.email,
          phone: dataUser.phone,
          gender: dataUser.gender,
          address: dataUser.address,
          role: dataUser.role,
          image: dataUser.image,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
};
