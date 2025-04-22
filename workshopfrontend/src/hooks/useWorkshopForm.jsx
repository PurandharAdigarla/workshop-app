import { useState, useEffect } from 'react';
import * as dateUtils from '../utils/dateUtils';

export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: "Title and Topic are required",
  REQUIRED_TUTORS: "Tutors are required",
  INVALID_DATE_FORMAT: "Workshop contains invalid date format",
  COMPLETED_WORKSHOP_DATES: "Dates cannot be modified for completed workshops",
  ONGOING_START_DATE: "Start date cannot be modified for ongoing workshops",
  END_DATE_BEFORE_START: "End date must be after start date",
  UPCOMING_START_DATE: "Start date must be today or later for upcoming workshops",
  UPCOMING_END_DATE: "End date must be today or later for upcoming workshops",
  ONGOING_END_DATE: "End date must be today or later for ongoing workshops",
  NOT_AUTHENTICATED: "You are not authenticated. Please log in again."
};

const useWorkshopForm = (workshop) => {
  const [form, setForm] = useState({
    workshopTitle: "",
    workshopTopic: "",
    workshopObjective: "",
    workshopDescription: "",
    workshopInstructions: "",
    workshopTutors: "",
    startDate: new Date(),
    endDate: new Date(),
  });
  
  const [error, setError] = useState("");
  const [dateHelperText, setDateHelperText] = useState({
    startDate: "",
    endDate: "",
  });
  
  // Compute workshop state from dates
  const workshopState = workshop 
    ? dateUtils.getWorkshopState(workshop.startDate, workshop.endDate)
    : { isUpcoming: false, isOngoing: false, isCompleted: false };
  
  const { isOngoing, isUpcoming, isCompleted } = workshopState;
  
  // Initialize form when workshop data changes
  useEffect(() => {
    if (workshop) {
      try {
        const startDate = new Date(workshop.startDate);
        const endDate = new Date(workshop.endDate);
        
        if (!dateUtils.isValidDate(startDate) || !dateUtils.isValidDate(endDate)) {
          setError(ERROR_MESSAGES.INVALID_DATE_FORMAT);
          return;
        }
        
        setForm({
          workshopTitle: workshop.workshopTitle || "",
          workshopTopic: workshop.workshopTopic || "",
          workshopObjective: workshop.workshopObjective || "",
          workshopDescription: workshop.workshopDescription || "",
          workshopInstructions: workshop.workshopInstructions || "",
          workshopTutors: Array.isArray(workshop.workshopTutors) 
            ? workshop.workshopTutors.join(", ") 
            : workshop.workshopTutors || "",
          startDate,
          endDate,
        });
        
        setError("");
        updateDateHelperText();
      } catch (err) {
        console.error("Error setting up form data", err);
        setError("Error loading workshop data");
      }
    }
  }, [workshop]);
  
  const updateDateHelperText = () => {
    if (isCompleted) {
      setDateHelperText({
        startDate: "Dates cannot be modified for completed workshops",
        endDate: "Dates cannot be modified for completed workshops",
      });
    } else if (isOngoing) {
      setDateHelperText({
        startDate: "Start date cannot be modified for ongoing workshops",
        endDate: "End date must be today or later for ongoing workshops",
      });
    } else if (isUpcoming) {
      setDateHelperText({
        startDate: "Start date must be today or later",
        endDate: "End date must be today or later",
      });
    } else {
      setDateHelperText({
        startDate: "",
        endDate: "",
      });
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (key, value) => {
    // Don't allow date changes for completed workshops
    if (isCompleted) {
      return;
    }
    
    // For ongoing workshops, don't allow changing the start date
    if (key === "startDate" && isOngoing) {
      return;
    }
    
    // Skip invalid dates
    if (!dateUtils.isValidDate(value)) {
      return;
    }
    
    const today = new Date();
    const newDate = dateUtils.normalizeDate(value);
    
    // Apply appropriate validation based on workshop state and date type
    if (key === "startDate" && isUpcoming && !dateUtils.isTodayOrLater(newDate)) {
      setError(ERROR_MESSAGES.UPCOMING_START_DATE);
      return;
    }
    
    if (key === "endDate") {
      const startDate = dateUtils.normalizeDate(form.startDate);
      
      if (!dateUtils.isAfter(newDate, startDate)) {
        setError(ERROR_MESSAGES.END_DATE_BEFORE_START);
        return;
      }
      
      if ((isOngoing || isUpcoming) && !dateUtils.isTodayOrLater(newDate)) {
        setError(isOngoing 
          ? ERROR_MESSAGES.ONGOING_END_DATE 
          : ERROR_MESSAGES.UPCOMING_END_DATE);
        return;
      }
    }
    
    // Clear any previous errors
    setError("");
    
    // Update the form state
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  
  const validateForm = () => {
    // Check required fields with trimming
    if (!form.workshopTitle || form.workshopTitle.trim() === '') {
      setError(ERROR_MESSAGES.REQUIRED_FIELDS);
      return false;
    }
    
    if (!form.workshopTopic || form.workshopTopic.trim() === '') {
      setError(ERROR_MESSAGES.REQUIRED_FIELDS);
      return false;
    }
    
    // Check if tutors are provided
    if (!form.workshopTutors || form.workshopTutors.trim() === '') {
      setError(ERROR_MESSAGES.REQUIRED_TUTORS);
      return false;
    }
    
    // Validate dates
    return validateDates();
  };
  
  const validateDates = () => {
    const today = dateUtils.normalizeDate(new Date());
    const startDate = dateUtils.normalizeDate(form.startDate);
    const endDate = dateUtils.normalizeDate(form.endDate);
    
    // For completed workshops, dates should not be modified
    if (isCompleted) {
      const originalStartDate = dateUtils.normalizeDate(workshop.startDate);
      const originalEndDate = dateUtils.normalizeDate(workshop.endDate);
      
      if (startDate.getTime() !== originalStartDate.getTime() ||
          endDate.getTime() !== originalEndDate.getTime()) {
        setError(ERROR_MESSAGES.COMPLETED_WORKSHOP_DATES);
        return false;
      }
    }
    
    // End date must be after start date
    if (!dateUtils.isAfter(endDate, startDate)) {
      setError(ERROR_MESSAGES.END_DATE_BEFORE_START);
      return false;
    }
    
    // For ongoing workshops, start date should not be modified
    if (isOngoing) {
      const originalStartDate = dateUtils.normalizeDate(workshop.startDate);
      
      if (startDate.getTime() !== originalStartDate.getTime()) {
        setError(ERROR_MESSAGES.ONGOING_START_DATE);
        return false;
      }
      
      if (!dateUtils.isTodayOrLater(endDate)) {
        setError(ERROR_MESSAGES.ONGOING_END_DATE);
        return false;
      }
    }
    
    // For upcoming workshops, dates should be today or later
    if (isUpcoming) {
      if (!dateUtils.isTodayOrLater(startDate)) {
        setError(ERROR_MESSAGES.UPCOMING_START_DATE);
        return false;
      }
      
      if (!dateUtils.isTodayOrLater(endDate)) {
        setError(ERROR_MESSAGES.UPCOMING_END_DATE);
        return false;
      }
    }
    
    return true;
  };
  
  const getFormData = () => {
    return {
      workshopId: workshop?.workshopId,
      workshopTitle: form.workshopTitle.trim(),
      workshopTopic: form.workshopTopic.trim(),
      workshopObjective: form.workshopObjective ? form.workshopObjective.trim() : '',
      workshopDescription: form.workshopDescription ? form.workshopDescription.trim() : '',
      workshopInstructions: form.workshopInstructions ? form.workshopInstructions.trim() : '',
      workshopTutors: form.workshopTutors
        .split(",")
        .map((tutor) => tutor.trim())
        .filter(Boolean),
      startDate: dateUtils.formatDateForAPI(form.startDate),
      endDate: dateUtils.formatDateForAPI(form.endDate),
    };
  };
  
  return {
    form,
    error,
    setError,
    dateHelperText,
    workshopState,
    handleChange,
    handleDateChange,
    validateForm,
    getFormData
  };
};

export default useWorkshopForm; 