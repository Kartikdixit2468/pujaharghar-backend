const db = require("../config/db");

const getAllPujas = async () => {
  try {
    const [puja_data] = await db.execute("select * from puja");
    if (puja_data.length > 0) {
      return { success: true, data: puja_data };
    }
    else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

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
    const [categories] = await db.execute(`
        SELECT 
          c.id,
          c.name,
          c.image,
          COUNT(p.puja_id) AS count
        FROM categories c
        LEFT JOIN puja p 
          ON p.category = c.id
        GROUP BY c.id, c.name, c.image
      `);

        console.log("Categories fetched:", categories);

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
      return { success: true, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getPujaByCategory = async (category) => {
  try {
    const [puja_data] = await db.execute(
      `select * from puja where category=?`,
      [category]
    );
    if (puja_data.length > 0) {
      return { success: true, data: puja_data };
    } else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  getAllPujas,
  getTrendingPujas,
  getCategories,
  getPujaDetails,
  getPujaByCategory,
};
