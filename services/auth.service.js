const User = require("../models/registerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = class Auth {
  constructor(app) {
    this.app = app;
  }

  registerUser = async (req, res) => {
    try {
      let { email, password, passwordCheck, name } = req.body;

      let error = this.checkRegisterUser({
        email,
        password,
        passwordCheck,
        name,
      });
      if (error) {
        return res.status(400).json({ msg: error });
      }

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        email,
        name,
        password: passwordHash,
      });

      const savedUser = await newUser.save();
      res.json(savedUser);
      console.log(savedUser);

      const userExists = await User.findOne({ email: email });
      if (userExists)
        return res
          .status(400)
          .json({ msg: "Пользователь с этой почтой уже существует." });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ err: err.message });
    }
  };

  checkRegisterUser = ({ email, password, passwordCheck, name }) => {
    if (!email || !password || !passwordCheck || !name) {
      return "Заполните все поля.";
    }
    this.checkPasswordForRegister(password, passwordCheck);
  };

  checkPasswordForRegister = (password, passwordCheck) => {
    const letterRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])");
    const numericRegex = new RegExp("(?=.*[0-9])");
    const simbolRegex = new RegExp("(?=.*[!@#$%^&*])");

    if (password.length < 7)
      return "Пароль должен состоять из 7 и более знаков.";

    if (letterRegex.test(password) == false)
      return "Пароль должеть иметь заглавные и строчные буквы.";

    if (numericRegex.test(password) === false)
      return "Пароль должен иметь цыфры.";

    if (simbolRegex.test(password) === false)
      return "Пароль должен иметь символы.";

    if (password !== passwordCheck) return "Пароли не совпадают.";
  };

  loginUser = async (req, res) => {
    try {
      let { emailLogin, passwordLogin } = req.body;

      if (!emailLogin || !passwordLogin)
        return res.status(400).json({ msg: "Заполните все поля" });

      const user = await User.findOne({ email: emailLogin });

      if (!user)
        return res.status(400).json({
          msg: "Такого аккаунта не существует. Попробуйте зарегистироваться.",
        });

      const ifMatch = await bcrypt.compare(passwordLogin, user.password);
      if (!ifMatch)
        return res.status(400).json({ msg: "Пароль или логин не совпадают." });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const deleteUser = await User.findByIdAndDelete(req.user);

      res.json(deleteUser);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  };

  checkToken = (req, res) => {
    try {
      const token = req.headers("x-auth-token");

      if (!token) return res.json(false);

      const verified = jwt.verify(token, process.env.JWT_SECRET);

      if (!verified) return res.json(false);

      return res.json(true);
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  };

  getUser = async (req, res) => {
    try {
      const user = await User.findById(req.user);
      res.json({
        name: user.name,
        id: user._id,
      });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  };
};
