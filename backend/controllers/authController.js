const dataStore = require("../lib/dataStore");

async function authUser(req, res, next) {
  try {
    const { mode = "login", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (mode === "signup") {
      const existingUser = await dataStore.findUserByEmail(email);

      if (existingUser) {
        return res.status(409).json({ error: "Email already exists." });
      }

      const user = await dataStore.createUser({ email, password });

      return res.status(201).json({
        message: "Signup successful",
        user,
      });
    }

    const user = await dataStore.findUserByCredentials(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    return res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authUser,
};
