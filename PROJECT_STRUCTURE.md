# TaskAI Project Structure

```
TaskAI/
├── App.tsx                          # Root component with Redux Provider
├── package.json                     # Dependencies and scripts
├── README.md                        # Project documentation
├── tsconfig.json                    # TypeScript configuration
│
└── src/
    ├── domain/                      # Business logic layer
    │   ├── types.ts                 # TypeScript types (Commitment, Reminder, etc.)
    │   ├── ladder.ts                # Reminder ladder generation logic
    │   └── urgency.ts               # Urgency scoring and sorting
    │
    ├── data/                        # Data access layer
    │   ├── repositories/            # Repository interfaces
    │   │   ├── CommitmentsRepository.ts
    │   │   ├── RemindersRepository.ts
    │   │   ├── AuthRepository.ts
    │   │   └── index.ts             # Repository exports (singleton instances)
    │   ├── mock/                    # Mock implementations
    │   │   ├── MockCommitmentsRepository.ts
    │   │   ├── MockRemindersRepository.ts
    │   │   └── MockAuthRepository.ts
    │   └── seed.ts                  # Seed data for development
    │
    ├── store/                       # Redux state management
    │   ├── slices/
    │   │   ├── onboardingSlice.ts   # Onboarding completion state
    │   │   ├── authSlice.ts         # Authentication state
    │   │   └── commitmentsSlice.ts  # Commitments state with thunks
    │   └── index.ts                 # Store configuration + redux-persist
    │
    ├── navigation/                  # Navigation setup
    │   ├── types.ts                 # Navigation type definitions
    │   └── RootNavigator.tsx        # Root navigator with flow logic
    │
    ├── ui/
    │   ├── components/              # Reusable UI components
    │   │   ├── Screen.tsx           # Safe area wrapper
    │   │   ├── Button.tsx           # Button component with variants
    │   │   ├── Input.tsx            # Text input with label/error
    │   │   ├── Badge.tsx            # Status badge component
    │   │   └── ListItem.tsx         # List item with title/subtitle/badge
    │   │
    │   └── screens/                 # Screen components
    │       ├── OnboardingCarouselScreen.tsx  # 3-slide onboarding
    │       ├── SignInScreen.tsx               # Sign in form
    │       ├── SignUpScreen.tsx               # Sign up form
    │       ├── HomeScreen.tsx                 # Commitments list (sorted by urgency)
    │       ├── AddEditCommitmentScreen.tsx     # Create/edit commitment form
    │       ├── ConfirmCommitmentScreen.tsx     # Preview before saving
    │       └── CommitmentDetailScreen.tsx       # View details, mark done, snooze
    │
    └── utils/                       # Utility functions
        ├── date.ts                  # Date formatting utilities
        ├── id.ts                    # ID generation (UUID)
        └── validation.ts             # Zod validation schemas
```

## Key Architecture Decisions

1. **Repository Pattern**: All data access goes through interfaces, making backend swap seamless
2. **Redux Toolkit**: Centralized state with async thunks (no sagas)
3. **Type Safety**: Full TypeScript coverage with proper navigation types
4. **Separation of Concerns**: Domain logic separate from UI and data layers
5. **Mock First**: Complete mock implementation allows full UI testing without backend

## File Count

- **Domain**: 3 files
- **Data**: 7 files (3 interfaces + 3 mocks + 1 seed)
- **Store**: 4 files (3 slices + 1 config)
- **Navigation**: 2 files
- **UI Components**: 5 files
- **UI Screens**: 7 files
- **Utils**: 3 files

**Total: 32 source files**
