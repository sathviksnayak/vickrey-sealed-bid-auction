export function validateAuction(req, res, next) {
  const { title, description, reservePrice, commitDuration, revealDuration } =
    req.body;

  if (!title?.trim())
    return res.status(400).json({ message: "Title is required." });

  if (!description?.trim())
    return res.status(400).json({ message: "Description is required." });

  if (Number(reservePrice) <= 0)
    return res.status(400).json({ message: "Invalid reserve price." });

  next();
}
