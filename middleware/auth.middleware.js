const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const { cookie } = req.headers;
  if (!cookie) {
    return res.status(400).json({ ok: false, message: "Cookie not found" });
  }
  const arr = cookie?.split("; ");
  const cookieObj = {};
  arr.forEach((item) => {
    const [key, value] = item.split("=");
    cookieObj[key] = value;
  });
  if (
    !cookieObj.token ||
    !cookieObj.userId ||
    !cookieObj.role ||
    !cookieObj.companyId
  ) {
    return res.status(400).json({ ok: false, message: "Cookie not found" });
  }

  const { token } = cookieObj;

  jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
    if (error) {
      res.status(404).json({ message: "Invalid token" });
    }
    req.id = user.id;
  });

  req.credentials = cookieObj;

  next();
}

module.exports = { verifyToken };
