# TaskAI - Commitment Manager

A React Native mobile app for managing commitments (expirations, deadlines, and open-ended tasks) with intelligent reminder scheduling.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and Java Development Kit

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install iOS dependencies:**
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Start Metro bundler:**
```bash
npm start
```

## 📁 Project Structure

```
src/
├── domain/              # Business logic and domain models
│   ├── types.ts         # TypeScript types and interfaces
│   ├── ladder.ts        # Reminder ladder generation logic
│   └── urgency.ts       # Urgency scoring and sorting
├── data/                # Data access layer
│   ├── repositories/    # Repository interfaces
│   │   ├── CommitmentsRepository.ts
│   │   ├── RemindersRepository.ts
│   │   └── AuthRepository.ts
│   ├── mock/            # Mock implementations (for development)
│   │   ├── MockCommitmentsRepository.ts
│   │   ├── MockRemindersRepository.ts
│   │   └── MockAuthRepository.ts
│   ├── seed.ts          # Seed data for mock repositories
│   └── repositories/index.ts  # Repository exports
├── store/               # Redux state management
│   ├── slices/
│   │   ├── onboardingSlice.ts
│   │   ├── authSlice.ts
│   │   └── commitmentsSlice.ts
│   └── index.ts         # Store configuration with redux-persist
├── navigation/          # Navigation setup
│   ├── types.ts         # Navigation type definitions
│   └── RootNavigator.tsx
├── ui/
│   ├── components/     # Reusable UI components
│   │   ├── Screen.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── ListItem.tsx
│   └── screens/         # Screen components
│       ├── OnboardingCarouselScreen.tsx
│       ├── SignInScreen.tsx
│       ├── SignUpScreen.tsx
│       ├── HomeScreen.tsx
│       ├── AddEditCommitmentScreen.tsx
│       ├── CommitmentDetailScreen.tsx
│       └── ConfirmCommitmentScreen.tsx
└── utils/               # Utility functions
    ├── date.ts          # Date formatting utilities
    ├── id.ts            # ID generation
    └── validation.ts    # Zod validation schemas
```

## 🏗️ Architecture

### Data Access Layer

The app uses a **repository pattern** to abstract data access. All UI components interact with repositories through interfaces, not direct implementations.

**Current Implementation:** Mock repositories (`src/data/mock/`)

**To Switch to Backend (Firebase/Supabase):**

1. Create new repository implementations in `src/data/firebase/` or `src/data/supabase/`
2. Update `src/data/repositories/index.ts` to export the new implementations:

```typescript
// Replace mock with real implementations
export const commitmentsRepository: CommitmentsRepository = new FirebaseCommitmentsRepository();
export const remindersRepository: RemindersRepository = new FirebaseRemindersRepository();
export const authRepository: AuthRepository = new FirebaseAuthRepository();
```

The UI layer requires **no changes** - it will automatically use the new backend.

### State Management

- **Redux Toolkit** for state management
- **redux-persist** for persisting onboarding completion and auth session
- All async operations use Redux thunks (no sagas)

### Navigation Flow

1. **Onboarding** → First-time users see 3-slide carousel
2. **Authentication** → Sign in/Sign up screens (mock auth)
3. **Main App** → Home screen with commitments list

Navigation automatically routes based on:
- `onboarding.hasSeenOnboarding` (persisted)
- `auth.session` (persisted)

## 📱 Features

### Commitment Types

1. **Expiration** - Items with expiration dates (passport, insurance, warranty)
   - Reminder ladder: 90d, 30d, 7d, 1d before expiration

2. **Deadline** - Tasks with deadlines
   - Reminder ladder: 14d, 7d, 1d before deadline

3. **Open-ended** - Important items without fixed dates
   - Reminder ladder: 14d after creation, then every 30d

### Core Functionality

- ✅ Create commitments with templates or custom entries
- ✅ View commitments sorted by urgency
- ✅ Mark commitments as done
- ✅ Snooze reminders (1, 3, or 7 days)
- ✅ View commitment details with reminder schedule
- ✅ Edit commitments

## 🔧 Backend Integration Points

### Where to Add Backend Code

1. **Repository Implementations** (`src/data/firebase/` or `src/data/supabase/`)
   - Implement the same interfaces as mock repositories
   - Replace async mock delays with real API calls

2. **Authentication** (`src/data/repositories/AuthRepository.ts`)
   - Replace mock sign in/up with Firebase Auth or Supabase Auth
   - Handle real token management

3. **Data Sync** (Future)
   - Add real-time listeners in repository implementations
   - Update Redux store on data changes

### Example: Firebase Integration

```typescript
// src/data/firebase/FirebaseCommitmentsRepository.ts
import { CommitmentsRepository } from '../repositories/CommitmentsRepository';
import { Commitment } from '../../domain/types';
import { collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export class FirebaseCommitmentsRepository implements CommitmentsRepository {
  async getAll(): Promise<Commitment[]> {
    const snapshot = await getDocs(collection(db, 'commitments'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commitment));
  }
  
  // ... implement other methods
}
```

## 🧪 Mock Data

The app includes seed data in `src/data/seed.ts`:
- Active commitments (expiring soon, far future)
- Overdue commitments
- Completed commitments
- Open-ended commitments

## 📦 Dependencies

### Core
- `react-native` - React Native framework
- `@reduxjs/toolkit` - Redux state management
- `react-redux` - React bindings for Redux
- `redux-persist` - State persistence
- `@react-navigation/native` - Navigation library
- `@react-navigation/native-stack` - Stack navigator

### Utilities
- `zod` - Schema validation
- `date-fns` - Date manipulation
- `uuid` - ID generation
- `@react-native-async-storage/async-storage` - Local storage
- `@react-native-community/datetimepicker` - Date picker

## 🐛 Troubleshooting

### iOS Build Issues
- Run `cd ios && pod install` after adding new dependencies
- Clean build: `cd ios && xcodebuild clean`

### Android Build Issues
- Clean: `cd android && ./gradlew clean`
- Rebuild: `npm run android`

### Metro Bundler Issues
- Clear cache: `npm start -- --reset-cache`

## 📝 Development Notes

- All repository calls are async (Promise-based) to mimic real network calls
- Mock repositories include artificial delays (50-500ms) to simulate network latency
- Redux state is persisted for onboarding and auth only (not commitments - they're fetched fresh)
- Reminders are generated automatically when commitments are created
- Urgency scoring considers: expiration status, next reminder date, days until target

## 🚧 Future Enhancements

- [ ] Real backend integration (Firebase/Supabase)
- [ ] Push notifications for reminders
- [ ] AI features (OCR, voice input) - interfaces ready
- [ ] Meetings feature
- [ ] Offline support
- [ ] Data export

## 📄 License

See LICENSE file for details.
