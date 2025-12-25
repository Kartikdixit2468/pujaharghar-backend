const db = require("../config/db");

const getTrendingPujas = async () => {
  try {
    const [puja_data] = await db.execute("select puja_id from trending_pujas");
    const IDs = puja_data.map((obj) => obj.puja_id);

    if (IDs.length > 0) {
      const placeholders = IDs.map(() => "?").join(", ");
      const [data] = await db.execute(
        `SELECT * FROM puja WHERE puja_id IN (${placeholders})`,
        IDs
      );
      return { success: true, data: data };
    } else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getCategories = async () => {
  try {
    const [categories] = await db.execute("select * from categories");
    
    if (categories.length > 0) {
      return { success: true, data: categories };
    } else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getPujaDetails = async (puja_id) => {
  try {
    const [puja_details] = await db.execute(
      `select * from puja where puja_id=?`,
      [puja_id]
    );

    if (puja_details.length > 0) {
      const data = puja_details[0];
      return { success: true, data: data };
    } else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { getTrendingPujas, getCategories, getPujaDetails };
