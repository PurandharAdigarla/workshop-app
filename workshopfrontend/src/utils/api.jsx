import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = `Error: ${error.response.status} ${error.response.statusText}`;
      }
      
      if (error.response.status === 401) {
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('attendeeId');
        localStorage.removeItem('adminId');
        localStorage.removeItem('userRole');

        // Redirect to unified login
        window.location.href = '/login';
      }
    } else if (error.request) {
      errorMessage = 'Server is not responding. Please try again later.';
    }
    
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);


export const workshopApi = {
  // Workshop api
  getUpcomingWorkshops: () => api.get('/workshop/upcoming'),
  getOngoingWorkshops: () => api.get('/workshop/ongoing'),
  getCompletedWorkshops: () => api.get('/workshop/completed'),
  registerForWorkshop: (workshopId, attendeeId) => api.post('/workshop/register', { workshopId, attendeeId }),
  deregisterFromWorkshop: (workshopId, attendeeId) => api.delete('/workshop/deregister', { 
    data: { workshopId, attendeeId } 
  }),
  submitFeedback: (feedbackData) => api.post('/workshop/submit-feedback', feedbackData),
  getPendingFeedbacks: (attendeeId) => api.get(`/workshop/pending-feedbacks/${attendeeId}`),
  getRegisteredWorkshops: (attendeeId) => api.get(`/workshop/registered/${attendeeId}`),
  getAttendedWorkshops: (attendeeId) => api.get(`/workshop/attended/${attendeeId}`),
  
  // Admin apis
  addWorkshop: (workshopData) => api.post('/workshop', workshopData),
  editWorkshop: (workshopId, workshopData) => api.patch(`/workshop/${workshopId}`, workshopData),
  deleteWorkshop: (workshopId) => api.delete(`/workshop/${workshopId}`),
  getRegistrations: (workshopId) => api.get(`/workshop/${workshopId}/registrations`),
  getFeedback: (workshopId) => api.get(`/workshop/feedback/${workshopId}`),
  getAllFeedbacks: () => api.get('/workshop/feedback'),
  
  // Attendee api
  signupAttendee: (attendeeData) => api.post('/attendees/signup', attendeeData),
  loginAttendee: (credentials) => api.post('/attendees/login', credentials),
  getAllAttendees: () => api.get('/attendees'),
  
  // Admin login
  loginAdmin: (credentials) => api.post('/admin/login', credentials)
};

export const handleApiSuccess = (message, callback) => {
  if (typeof callback === 'function') {
    callback(message);
  }
  return { success: true, message };
};

export default api; 