import { workshopApi } from "../../../utils/api";

export const RegisterForWorkshop = async (workshopId) => {
  const attendeeId = parseInt(localStorage.getItem("attendeeId"));

  if (!attendeeId) {
    console.error("Missing attendee ID");
    return { success: false, error: "Missing attendee ID" };
  }

  try {
    const response = await workshopApi.registerForWorkshop(workshopId, attendeeId);
    return { success: true, data: response.data };
  } catch (err) {
    console.error("Registration failed:", err);
    return { 
      success: false, 
      error: err,
      message: err.userMessage || "Failed to register for workshop" 
    };
  }
};

export default RegisterForWorkshop;
