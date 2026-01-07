function convertStringToDate(dateStr) {
  // Smart date converter - accepts DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, and ISO format
  // Returns YYYY-MM-DD format for MySQL
  if (!dateStr || typeof dateStr !== "string") return null;

  let day, month, year;

  // Check if it's ISO format (YYYY-MM-DDTHH:MM:SS.FFFZ or similar)
  if (dateStr.includes("T")) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      
      // Extract date components from ISO string directly
      const isoDate = dateStr.split("T")[0]; // Get YYYY-MM-DD part
      const [isoYear, isoMonth, isoDay] = isoDate.split("-").map(Number);
      
      if (isoMonth < 1 || isoMonth > 12 || isoDay < 1 || isoDay > 31) {
        console.error("Invalid ISO date components:", { isoYear, isoMonth, isoDay });
        return null;
      }
      
      return isoDate; // Already in YYYY-MM-DD format
    } catch (error) {
      console.error("Error parsing ISO date:", error);
      return null;
    }
  }

  // Check if it's already in YYYY-MM-DD format
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const possibleYear = parseInt(parts[0]);
      const possibleMonth = parseInt(parts[1]);
      const possibleDay = parseInt(parts[2]);
      
      if (possibleYear > 1900 && possibleMonth >= 1 && possibleMonth <= 12 && possibleDay >= 1 && possibleDay <= 31) {
        return dateStr; // Already in correct format
      }
    }
  }

  // Handle slash-separated format (DD/MM/YYYY or MM/DD/YYYY)
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;

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

    return `${year}-${mm}-${dd}`; // Returns 'YYYY-MM-DD'
  }

  return null;
}

module.exports = { convertStringToDate };
