# Edit Workshop Feature - Developer Guide

## Overview

The Edit Workshop feature allows administrators to update workshop details, with special rules for dates based on the workshop's state.

## Key Components

1. **EditWorkshopDialog.jsx**: The main UI component that displays the edit form
2. **useWorkshopForm.js**: A custom hook that handles form state and validation logic
3. **dateUtils.js**: Utility functions for date manipulation and validation

## Workshop States

Workshops can be in three states:

- **Upcoming**: Start date is in the future
- **Ongoing**: Start date is in the past or today, end date is today or in the future
- **Completed**: End date is in the past

## Date Validation Rules

The edit functionality enforces specific rules based on the workshop state:

1. **Completed Workshops**:
   - No dates can be modified
   - Other details (title, topic, etc.) can still be edited

2. **Ongoing Workshops**:
   - Start date cannot be modified (workshop has already begun)
   - End date must be today or in the future
   - All other fields can be edited

3. **Upcoming Workshops**:
   - Start date must be today or in the future
   - End date must be after start date and today or in the future
   - All other fields can be edited

## Code Architecture

We've implemented a clean separation of concerns:

1. **Presentational Component** (EditWorkshopDialog.jsx):
   - Handles the UI
   - Uses the custom hook for form state and validation
   - Handles API calls and success/error states

2. **Business Logic** (useWorkshopForm.js):
   - Manages form state
   - Implements validation rules
   - Prepares data for API submission

3. **Utility Functions** (dateUtils.js):
   - Centralizes date manipulation
   - Determines workshop state
   - Formats dates for API

## Example Usage

```jsx
// In a parent component
import EditWorkshopDialog from './EditWorkshopDialog';

function AdminDashboard() {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleSuccess = (message) => {
    // Show success message and refresh workshop list
    showMessage(message);
    fetchWorkshops();
  };

  return (
    <>
      {/* Other components */}
      
      <EditWorkshopDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        workshop={selectedWorkshop}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

## Error Messages

The component provides clear error messages for various validation scenarios:

- "Title and Topic are required"
- "Dates cannot be modified for completed workshops"
- "Start date cannot be modified for ongoing workshops"
- "End date must be after start date"
- "Start date must be today or later for upcoming workshops"
- "End date must be today or later for ongoing workshops"

## Maintainability

The code has been structured for easy maintenance:

1. **Centralized Error Messages**: All error messages are defined in one place
2. **Reusable Hooks**: The form logic can be reused in other components
3. **Documented Functions**: Each function has JSDoc comments explaining its purpose
4. **Separated Concerns**: UI, logic, and utilities are clearly separated 