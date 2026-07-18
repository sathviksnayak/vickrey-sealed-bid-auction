export function validateAuctionForm(form) {
  const sanitized = {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    reservePrice: Number(form.reservePrice),
    commitDuration: Number(form.commitDuration),
    revealDuration: Number(form.revealDuration),
  };

  const errors = {};

  if (!sanitized.title) errors.title = "Title is required.";
  else if (sanitized.title.length > 100)
    errors.title = "Title cannot exceed 100 characters.";

  if (!sanitized.description) errors.description = "Description is required.";
  else if (sanitized.description.length > 1000)
    errors.description = "Description is too long.";

  if (!sanitized.category) errors.category = "Category is required.";

  if (Number.isNaN(sanitized.reservePrice) || sanitized.reservePrice <= 0)
    errors.reservePrice = "Reserve price must be greater than 0.";

  if (Number.isNaN(sanitized.commitDuration) || sanitized.commitDuration < 1)
    errors.commitDuration = "Commit duration must be at least 1 minute.";

  if (Number.isNaN(sanitized.revealDuration) || sanitized.revealDuration < 1)
    errors.revealDuration = "Reveal duration must be at least 1 minute.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: sanitized,
  };
}
