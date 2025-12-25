function convertStringToDate(dateStr) {
  // Expects input like '4/12/2000'
  // Returns '2000-12-04' (YYYY-MM-DD format)
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("/"); // ['4', '12', '2000']
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;

  // Zero-pad month and day
  const mm = month.padStart(2, "0");
  const dd = day.padStart(2, "0");

  return `${year}-${mm}-${dd}`; // Returns '2000-12-04'
}

module.exports = { convertStringToDate };
