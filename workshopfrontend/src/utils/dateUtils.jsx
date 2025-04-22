
export const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const isValidDate = (date) => {
  return date && !isNaN(new Date(date).getTime());
};

export const formatDateForAPI = (date) => {
  if (!isValidDate(date)) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const isTodayOrLater = (date) => {
  const today = normalizeDate(new Date());
  const checkDate = normalizeDate(date);
  return checkDate >= today;
};

export const isAfter = (date, compareDate) => {
  const d1 = normalizeDate(date);
  const d2 = normalizeDate(compareDate);
  return d1 > d2;
};

export const getWorkshopState = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { isUpcoming: false, isOngoing: false, isCompleted: false };
  }
  
  const today = normalizeDate(new Date());
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  
  const isUpcoming = start > today;
  const isOngoing = (start <= today) && (end >= today);
  const isCompleted = end < today;
  
  return { isUpcoming, isOngoing, isCompleted };
}; 