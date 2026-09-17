# Optional Firebase setup for EventHub

This project is currently configured to use the required SQLite + Prisma + Express backend for the assignment.

If you want to add Firebase authentication as an optional extra layer, follow these steps:

1. Create a Firebase web app in the Firebase console.
2. Copy the SDK values into `app.json` under `expo.extra`.
3. Replace the placeholder values in `app.json` with your actual Firebase project config.
4. Use the helper methods in `src/lib/firebase.ts` for register/login/logout.

Example:

```ts
import {
  loginWithFirebase,
  registerWithFirebase,
  logoutFromFirebase,
} from '@/lib/firebase';
```

Then call:

```ts
await registerWithFirebase(email, password);
await loginWithFirebase(email, password);
await logoutFromFirebase();
```

Note: This is optional only. The assignment requirement is still the SQLite-backed REST API implementation already present in the project.
