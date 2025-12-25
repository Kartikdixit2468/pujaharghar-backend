const db = require("../config/db");

const getPackagesByPujaId = async (puja_id) => {
  try {
    const [packages_details] = await db.execute(
      `select * from package where puja_id=?`,
      [puja_id]
    );

    const data = packages_details.map((package) => {
      const desc = package.description;
      const features = desc.split("|").map((item) => item.trim());
      return {
        id: package.package_id,
        name: package.name + " Package",
        features: features,
        price: package.price,
      };
    });

    if (data.length > 0) {
      return { success: true, data: data };
    } else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getPackageCheckoutDetails = async (package_id) => {
  try {
    const [package_info] = await db.execute(
      `select * from package where package_id=?`,
      [package_id]
    );

    if (package_info.length > 0) {
      const puja_id = package_info[0].puja_id;
      const [puja_info] = await db.execute(
        `select * from puja where puja_id=?`,
        [puja_id]
      );

      if (puja_info.length > 0) {
        const package_data = package_info[0];
        const puja_data = puja_info[0];
        const desc = package_data.description;
        const features = desc.split("|").map((item) => item.trim());

        const data = {
          package_id: package_data.package_id,
          package_name: package_data.name,
          package_price: package_data.price,
          features: features,
          puja_id: puja_data.puja_id,
          puja_name: puja_data.NAME,
          puja_desc: puja_data.description,
          travel_cost: 500,
        };
        return { success: true, data: data };
      } else {
        return { success: false, error: "Dataset Empty", data: {} };
      }
    } else {
      return { success: false, error: "Dataset Empty", data: {} };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { getPackagesByPujaId, getPackageCheckoutDetails };
