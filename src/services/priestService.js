const db = require("../config/db");

const getAvailablePriests = async () => {
  try {
    const [priest_list] = await db.execute(
      `select * from pandit where booking_status=0`
    );

    const data = priest_list.map((priest) => {
      return {
        id: priest.pandit_id,
        name: priest.name,
        gender: priest.gender,
        exp: priest.experience,
        img: priest.photo,
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

module.exports = { getAvailablePriests };
