# Workshop platform - Project Documentation

## 1. Overview
The workshop platform is a comprehensive system designed to manage workshops efficiently. It allows administrators to create and manage workshops, track attendance, gather feedback, and generate workshop-related statistics. Additionally, attendees can register themselves for workshops, making the process more streamlined.

## 2. Key Data Points
- **Workshops Status Overview:** Displays the number of workshops in different states (Open, Live, Closed).
- **Attendance Tracking:** Calculates and displays the percentage of attendees for each workshop.
- **Feedback Analytics:** Aggregates and presents the average feedback rating for each workshop.
- **Top-Rated Sessions:** Highlights workshops with the best ratings based on feedback.

## 3. Features
### 3.1 Administrator Features
- **Dashboard Overview:** Displays workshop statistics, attendance rates, and feedback summaries.
- **Workshop Management:** Create, update, and soft delete workshops.
- **Attendee Management:** Add and manage workshop attendees.
- **Navigation System:** Provides access to workshop creation, workshop details, and attendee management.
- **Secure Login and Logout:** Admins must authenticate before accessing the dashboard.

### 3.2 Attendee Features
- **Workshop Registration:** Attendees can register for a workshop by providing their name, email, and phone number.
- **Feedback Submission:** After attending a workshop, attendees can submit feedback and rate their experience.
- **Attendance Confirmation:** Attendance is marked when feedback is submitted.

## 4. Create & Manage Workshops
### 4.1 Workshop Form Fields
- **Workshop Name** – Title of the workshop.
- **Description** – A short summary of the workshop’s content.
- **Topic** – The subject or category of the workshop.
- **Start Date** – Date when the workshop begins.
- **End Date** – Date when the workshop concludes.
- **Status** – Indicates whether the workshop is Open, Live, or Closed.
- **Trainer Name** – Name of the trainer leading the workshop.
- **Trainer Mobile** – Contact number of the trainer.
- **Trainer Email** – Email address of the trainer.

### 4.2 Buttons
- **Save** – Saves a new or edited workshop.
- **Cancel** – Cancels the operation without saving changes.

### 4.3 Functionalities
- **Create Workshops:** Admins can create new workshops with relevant details.
- **Update Workshops:** Existing workshops can be modified by the admin.
- **Soft Delete Workshops:** Instead of permanent deletion, workshops are flagged as deleted in the database.

## 5. Attendee Registration & Management
### 5.1 Attendee Form Fields
- **Full Name** – Name of the attendee.
- **Mobile Number** – Contact number of the attendee.
- **Email Address** – Email ID of the attendee.

### 5.2 Buttons
- **Add Attendee** – Adds an attendee to the workshop.
- **Save Attendees** – Saves the list of attendees.
- **Cancel** – Cancels the operation without saving.

### 5.3 Functionalities
- **Manual Addition:** Admins can manually add multiple attendees to a workshop.
- **Self-Registration:** Attendees can register themselves by providing their name, email, and mobile number.
- **Attendee List Management:** The saved list of attendees is linked to each workshop.

## 6. Feedback Submission & Attendance Tracking
### 6.1 Feedback Submission URL
- Endpoint: `/attendance/{mobile_number}`
- Used to submit feedback and confirm attendance.

### 6.2 Feedback Form Fields
- **Rate the Workshop (1-5 stars)** – Attendees provide a rating.
- **Feedback (textarea)** – Attendees can leave comments about their experience.

### 6.3 Buttons
- **Submit** – Submits the feedback and marks attendance.

### 6.4 Functionalities
- **Mark Attendance:** Attendees are marked as present once they submit feedback.
- **Store Feedback:** Feedback and ratings are saved for analysis.
- **Analyze Feedback:** The system calculates and displays average ratings for workshops.

## 7. Technical Requirements
### 7.1 Frontend (React.js 19, Material UI, hooks, routes, axios, redux)
- **Form Validation:** Ensures required fields are filled, emails are valid, and dates are correctly entered.
- **Data Fetching:** Retrieves workshop statistics and attendee lists from the backend.
- **User Interface:** Uses Material UI components to create a visually appealing design.
- **Role-Based Access:** Implements protected routes so only admins can manage workshops.

### 7.2 Backend (Spring Boot 3 + REST APIs)
- **Workshop APIs:**
    - Create, update, and soft delete workshops.
    - Retrieve active workshops (excluding deleted ones).
- **Attendee APIs:**
    - Register attendees manually or through self-registration.
    - Retrieve attendee lists for workshops.
- **Feedback & Attendance APIs:**
    - Submit feedback and mark attendance.
    - Retrieve workshop ratings and feedback summaries.
- **Security:**(Spring security 6, JWT)
    - Uses JWT-based authentication with Spring Security.
    - Implements role-based access control (Admin vs. Attendee).
- **Data Processing:**(MySQL 8, JPA)
    - Uses SQL queries to calculate percentages and averages.
    - Validates input data to prevent modification of past workshops.

## 8. System Flow Diagram
### 8.1 Admin Workflow
1. **Login** → Authenticate via JWT.
2. **Dashboard Access** → View statistics on workshops, attendance, and feedback.
3. **Manage Workshops** → Create, edit, or soft delete workshops.
4. **Add Attendees** → Manually add attendees to workshops.
5. **Monitor Attendance & Feedback** → Analyze workshop success and attendee engagement.
6. **Logout** → Securely exit the dashboard.

### 8.2 Attendee Workflow
1. **Register for Workshop** → Provide name, email, and phone number.
2. **Receive Confirmation** → Registration is recorded, and confirmation is sent.
3. **Attend Workshop** → Participate in the scheduled session.
4. **Submit Feedback** → Provide a rating and comments.
5. **Attendance Confirmation** → Attendance is marked upon feedback submission.


## Spring Boot Dependencies:
### Build - maven
1. Spring Web – Required for building RESTful APIs.
2. Lombok – Reduces boilerplate code (Getters, Setters, Constructors, etc.).
3. Spring Security – Provides authentication & authorization mechanisms.
4. Spring Boot Starter JWT (jjwt-api, jjwt-impl, jjwt-jackson) – Required for JWT-based authentication.
5. Spring Data JPA – Provides ORM support for database interactions.
6. MySQL Driver – Enables MySQL connectivity.

