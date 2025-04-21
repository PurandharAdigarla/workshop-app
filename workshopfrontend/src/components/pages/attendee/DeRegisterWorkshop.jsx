import { workshopApi } from "../../../utils/api";

export const DeRegisterWorkshop = async (workshopId) => {
  const attendeeId = parseInt(localStorage.getItem("attendeeId"));

  if (!attendeeId) {
    console.error("Missing attendee ID");
    return { success: false, error: "Missing attendee ID" };
  }

  try {
    const response = await workshopApi.deregisterFromWorkshop(workshopId, attendeeId);
    return { success: true, data: response.data };
  } catch (err) {
    console.error("Deregistration failed:", err);
    return { 
      success: false, 
      error: err,
      message: err.userMessage || "Failed to deregister from workshop"
    };
  }
};

export default DeRegisterWorkshop; 