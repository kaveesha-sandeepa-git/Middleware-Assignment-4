## SwiftTrack Driver UI (React Native)

This is a **driver-side mobile UI prototype** for the SwiftLogistics / "SwiftTrack" middleware assignment. It focuses only on the driver app requirements and uses mocked data so you can plug it into your middleware layer.

### Tech stack

- **React Native / Expo** (open source)
- **React Navigation** for stack + tab navigation

### Screens implemented

- **Sign-in**: Static UI for driver authentication (to be wired to your auth/middleware gateway).
- **Home (Dashboard)**: Shows today’s route summary, completed vs total stops, and next stops.
- **Manifest**: Full list of today’s delivery stops, navigates to stop details.
- **Stop details**: Stop-level info (address, time window, payment info) and buttons to mark as *delivered* or *failed*.
- **Proof of delivery**: UI placeholder where you would integrate signature/photo capture plus an optional note.
- **Notifications**: Mock real-time route/priority notifications that in the real system would come from your pub-sub middleware layer.

All data is currently **hard-coded mocks**. In your middleware architecture, you should expose a REST/GraphQL facade (or BFF) that aggregates CMS/ROS/WMS data; then replace the mocked data with API calls.

### Running the app

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Expo:

   ```bash
   npx expo start
   ```

3. Open the app on an Android emulator, iOS simulator, or physical device (Expo Go).

### How to connect this to your middleware

- Replace the mocked lists in:
  - `HomeScreen` (next stops + summary)
  - `ManifestScreen` (driver manifest)
  - `StopDetailsScreen` and `ProofOfDeliveryScreen` (update status + POD)
  - `NotificationsScreen` (push-style events)
- Use your middleware’s driver-facing API endpoints (e.g. `/driver/{id}/manifest`, `/delivery/{id}/events`) to:
  - Fetch the assigned route from ROS (via middleware).
  - Stream WMS real-time status via WebSockets/Server-Sent Events/long polling.
  - Post delivery events (DELIVERED/FAILED + POD) so your middleware can fan them out to CMS, ROS, and WMS.

This keeps the **mobile app thin** and pushes all protocol translation, orchestration, reliability, and security concerns into the middleware layer, as required by the assignment.

