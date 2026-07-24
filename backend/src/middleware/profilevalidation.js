import { body, validationResult } from "express-validator";

export const validateProfile = [
  body("username")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Za-z][A-Za-z0-9_]{2,19}$/)
    .withMessage(
      "Username must start with a letter and contain only letters, numbers, and underscores."
    ),

  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    next();
  },
];
