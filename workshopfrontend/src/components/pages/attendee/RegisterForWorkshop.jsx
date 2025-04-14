import axios from "axios";

export const RegisterForWorkshop = async (workshopId) => {
  const token = localStorage.getItem("accessToken");
  const attendeeId = parseInt(localStorage.getItem("attendeeId"));

  if (!token || !attendeeId) {
    console.error("Missing token or attendee ID");
    return { success: false, error: "Missing token or attendee ID" };
  }

  try {
    const res = await axios.post(
      "http://localhost:8080/workshop/register",
      { attendeeId, workshopId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Registration failed:", err);
    return { success: false, error: err };
  }
};

export default RegisterForWorkshop;
