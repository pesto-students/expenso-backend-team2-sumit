function getTeams(req, res) {
  const { userId, role, companyId } = req.credentials;
  res.status(200).json({ message: "Testing" });
}

module.exports = { getTeams };
