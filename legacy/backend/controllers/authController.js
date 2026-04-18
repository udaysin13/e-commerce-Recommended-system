const prisma = require("../lib/prisma");
const { hashPassword, sanitizeUser, signJwt, verifyPassword } = require("../lib/auth");

function createAuthResponse(user, message) {
  const safeUser = sanitizeUser(user);
  const token = signJwt({
    id: safeUser.id,
    email: safeUser.email,
    name: safeUser.name || null,
  });

  return {
    message,
    token,
    user: safeUser,
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    return res.json(createAuthResponse(user, "Login successful"));
  } catch (error) {
    next(error);
  }
}

async function signup(req, res, next) {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name,
        phone,
      },
    });

    return res.status(201).json(createAuthResponse(user, "Signup successful"));
  } catch (error) {
    next(error);
  }
}

async function authUser(req, res, next) {
  if (req.body.mode === "signup") {
    return signup(req, res, next);
  }

  return login(req, res, next);
}

module.exports = {
  authUser,
  login,
  signup,
};
