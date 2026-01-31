// Common
export const COMMON_STRINGS = {
  Empty: '',
  NO_DATE: 'No date',
} as const;

// Screen Titles
export const SCREEN_TITLES = {
  HOME: 'My Tasks',
  NEW_COMMITMENT: 'New Task',
  EDIT_COMMITMENT: 'Edit Task',
  COMMITMENT_DETAILS: 'Task Details',
  CONFIRM_COMMITMENT: 'Confirm Task',
  SIGN_UP: 'Sign Up',
  SIGN_IN: 'Sign In',
  DELETE_COMMITMENT: 'Delete Task',
  EDIT_REMINDER: 'Edit Reminder',
  ADD_SNOOZE: 'Add Snooze',
  EXPIRED: 'Expired',
} as const;

// Home section titles
export const HOME_SECTIONS = {
  ACTIVE: 'Active',
  DONE: 'Done',
  VIEW_EXPIRED: 'View Expired',
  EXPIRED_COUNT: (n: number) => (n === 1 ? '1 expired item' : `${n} expired items`),
} as const;

// Auth Screen Strings
export const AUTH_STRINGS = {
  WELCOME_BACK: 'Welcome Back',
  SIGN_IN_TO_CONTINUE: 'Sign in to continue',
  CREATE_ACCOUNT: 'Create Account',
  SIGN_UP_TO_GET_STARTED: 'Sign up to get started',
  SIGN_IN: 'Sign In',
  SIGN_UP: 'Sign Up',
  SIGN_IN_WITH_GOOGLE: 'Sign in with Google',
  SIGN_UP_WITH_GOOGLE: 'Sign up with Google',
  DONT_HAVE_ACCOUNT: "Don't have an account?",
  ALREADY_HAVE_ACCOUNT: 'Already have an account?',
} as const;

// Onboarding Strings
export const ONBOARDING_STRINGS = {
  SLIDES: [
    {
      title: 'Welcome to TaskAI',
      description: 'Manage your tasks and never miss an important deadline again.',
      image: '📋',
    },
    {
      title: 'Smart Reminders',
      description: 'Get notified at the right time with our intelligent reminder system.',
      image: '🔔',
    },
    {
      title: 'Stay Organized',
      description: 'Track expirations, deadlines, and open-ended tasks all in one place.',
      image: '✅',
    },
  ],
  NEXT: 'Next',
  GET_STARTED: 'Get Started',
} as const;

// Form Labels and Placeholders
export const FORM_STRINGS = {
  EMAIL: 'Email',
  PASSWORD: 'Password',
  NAME: 'Name',
  TITLE: 'Title',
  TYPE: 'Type',
  TARGET_DATE: 'Target Date',
  CREATED_AT: 'Created At',
  NEXT_REMINDER: 'Next reminder',
  REMINDER: 'Reminder',
  REMINDER_SCHEDULE: 'Reminder Schedule',
  UPCOMING_REMINDERS: 'Upcoming Reminders',
  TARGET_DATE_LABEL: 'Target date: ',
  REMINDER_LABEL: 'Reminder: ',
  DATE_FORMAT: 'yyyy-MM-dd',
  TIME_FORMAT: 'HH:mm',
  SNOOZE_LABEL: 'Snooze',
  CHOOSE_TEMPLATE: 'Choose Template',
  ENTER_EMAIL: 'Enter your email',
  ENTER_PASSWORD: 'Enter your password',
  ENTER_NAME: 'Enter your name',
  ENTER_COMMITMENT_TITLE: 'Enter task title',
  DESCRIPTION: 'Description',
  ENTER_DESCRIPTION: 'Optional details (e.g. notes, amounts)',
  DATE_FORMAT_PLACEHOLDER: '2024-12-31',
  DATE_FORMAT_LABEL: 'Target Date (YYYY-MM-DD)',
  OPEN_ENDED: 'Open-ended',
  REMINDER_DATE: 'Date (YYYY-MM-DD)',
  REMINDER_TIME: 'Time (HH:mm)',
  SNOOZE_LIMIT_REACHED: 'You can have at most 3 snoozes. Remove or edit one to add another.',
  ADD_REMINDER: 'Add Reminder',
} as const;

// Button Labels
export const BUTTON_STRINGS = {
  NEXT: 'Next',
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  MARK_AS_DONE: 'Mark as Done',
  ADD_A_SNOOZE: 'Add a Snooze',
  ADD_A_REMINDER: 'Add a Reminder',
} as const;

// Commitment Templates
export const COMMITMENT_TEMPLATES = {
  PASSPORT: 'Passport',
  INSURANCE: 'Insurance',
  WARRANTY: 'Warranty',
  CUSTOM: 'Custom',
} as const;

// Commitment Types
export const COMMITMENT_TYPES = {
  EXPIRATION: 'Expiration',
  DEADLINE: 'Deadline',
  OPEN: 'Open',
} as const;

// Status Labels
export const STATUS_LABELS = {
  ACTIVE: 'Active',
  DONE: 'Done',
  EXPIRED: 'Expired',
} as const;

// Empty State Messages
export const EMPTY_STATE_STRINGS = {
  LOADING: 'Loading...',
  NO_COMMITMENTS: 'No tasks yet',
  NO_COMMITMENTS_SUBTEXT: 'Tap the + button to add your first task',
  COMMITMENT_NOT_FOUND: 'Task not found',
} as const;

// Alert Messages
export const ALERT_STRINGS = {
  MARK_AS_DONE_TITLE: 'Mark as Done',
  MARK_AS_DONE_MESSAGE: 'Are you sure you want to mark this task as done?',
  MARK_DONE: 'Mark Done',
  REMINDERS_PAST_DATE_TITLE: 'Reminders after this date',
  REMINDERS_PAST_DATE_MESSAGE:
    'Some reminders are set after that date. The system will reschedule all reminders to fit your new, earlier date.',
  ADJUST_REMINDERS: 'Adjust reminders',
} as const;

// Error Messages
export const ERROR_STRINGS = {
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_LONG: 'Title must be less than 100 characters',
  TARGET_DATE_REQUIRED: 'Target date is required',
  TARGET_DATE_FUTURE: 'Target date must be in the future',
  SIGN_IN_FAILED: 'Sign in failed',
  SIGN_UP_FAILED: 'Sign up failed',
  GOOGLE_SIGN_IN_FAILED: 'Google sign in failed',
  FAILED_TO_FETCH_COMMITMENTS: 'Failed to fetch tasks',
  FAILED_TO_CREATE_COMMITMENT: 'Failed to create task',
  FAILED_TO_UPDATE_COMMITMENT: 'Failed to update task',
  COMMITMENT_NOT_FOUND: 'Task not found',
  REMINDER_AFTER_TARGET: 'Reminder date cannot be after the task target date',
  SNOOZE_SAME_DAY: 'Only one snooze per day allowed.',
  REMINDER_SAME_DAY: 'Only one reminder per day allowed.',
  MAX_REMINDERS: 'Maximum 4 reminders allowed.',
  DATE_MUST_BE_FORMAT: (format: string) => `Date must be ${format}`,
  TIME_MUST_BE_FORMAT: (format: string) => `Time must be ${format}`,
  INVALID_DATE_TIME: 'Invalid date or time',
  DATE_TIME_MUST_BE_FUTURE: 'Date and time must be in the future',
} as const;

// Urgency / reason strings (e.g. for sorting or tooltips)
export const URGENCY_STRINGS = {
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  OVERDUE_REMINDER: 'Overdue reminder',
  DAYS_UNTIL_REMINDER: (days: number) => `${days} days until reminder`,
  PAST_TARGET_DATE: 'Past target date',
  DAYS_UNTIL_TARGET: (days: number) => `${days} days until target`,
  OPEN_ENDED: 'Open-ended',
} as const;
