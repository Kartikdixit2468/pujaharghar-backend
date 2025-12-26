function convertStringToDate(dateStr) {
  // Smart date converter - accepts both DD/MM/YYYY and MM/DD/YYYY
  // Returns '2000-MM-DD' (YYYY-MM-DD format for MySQL)
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  let day, month, year;
  const firstNum = parseInt(parts[0]);
  const secondNum = parseInt(parts[1]);
  const thirdNum = parseInt(parts[2]);

  // Detect format: if first number > 12, it must be day (DD/MM/YYYY)
  if (firstNum > 12) {
    // DD/MM/YYYY format
    day = firstNum;
    month = secondNum;
    year = thirdNum;
  } else if (secondNum > 12) {
    // MM/DD/YYYY format
    month = firstNum;
    day = secondNum;
    year = thirdNum;
  } else {
    // Default to DD/MM/YYYY if ambiguous
    day = firstNum;
    month = secondNum;
    year = thirdNum;
  }

  // Validate month (1-12) and day (1-31)
  if (month < 1 || month > 12) {
    console.error("Invalid month:", month);
    return null;
  }

  if (day < 1 || day > 31) {
    console.error("Invalid day:", day);
    return null;
  }

  // Validate year (should be 4 digits and reasonable)
  if (year < 1900 || year > 2100) {
    console.error("Invalid year:", year);
    return null;
  }

  // Format as YYYY-MM-DD with zero padding
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  return `${year}-${mm}-${dd}`; // Returns '2000-01-21'
}

module.exports = { convertStringToDate };
