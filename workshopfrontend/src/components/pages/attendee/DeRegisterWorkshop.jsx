import axios from "axios";

export const DeRegisterWorkshop = async (workshopId) => {
  const token = localStorage.getItem("accessToken");
  const attendeeId = parseInt(localStorage.getItem("attendeeId"));

  if (!token || !attendeeId) {
    console.error("Missing token or attendee ID");
    return { success: false, error: "Missing token or attendee ID" };
  }

  try {
    const payload = {
      attendeeId,
      workshopId,
    };

    const res = await axios.delete(
      "http://localhost:8080/workshop/deregister",
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: payload,
      }
    );

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Deregistration failed:", err);
    return { 
      success: false, 
      error: err,
      message: err.response?.data || "Failed to deregister from workshop."
    };
  }
};

export default DeRegisterWorkshop; 