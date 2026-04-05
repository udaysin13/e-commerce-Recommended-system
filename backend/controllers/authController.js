const prisma = require("../lib/prisma");

async function authUser(req, res, next) {
  try {
    const { mode = "login", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (mode === "signup") {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: "Email already exists." });
      }

      const user = await prisma.user.create({
        data: { email, password },
      });

      return res.status(201).json({
        message: "Signup successful",
        user,
      });
    }

    const user = await prisma.user.findFirst({
      where: { email, password },
    });

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
