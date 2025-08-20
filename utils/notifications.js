import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const Messages = [
  "Open LockIN. Farm one dopamine, legally.",
  "Your checklist is gossiping about you. Tap to defend yourself.",
  "The streak is thirsty. Hydrate it with one tap.",
  "Plot twist opportunity inside the app. Enter?",
  "Your roadmap is pacing in circles. Let it out.",
  "Low effort, high smug: reopen LockIN.",
  "Main quest is waiting in the lobby. Don’t make it awkward.",
  "Reminder: your future flex lives behind this notification.",
  "One tap now = ten fewer tabs later.",
  "You left your progress on read. Text back.",
  "Your goals filed a missing person report. Show up.",
  "Brain Gremlin says ‘scroll’. We say ‘open’.",
  "Momentum knocked. You gonna let it in or…",
  "We kept your seat warm. Sit. Ship. Bounce.",
  "Your timeline wants receipts. LockIN prints them.",
  "Tap in. Procrastination can’t follow you past this button.",
  "Your comfort zone is gaming your MMR. Counter-queue.",
  "Unlock: tiny win → instant peace.",
  "Return to app. Convert anxiety into checkmarks.",
  "The task won’t bite. Your thoughts might. Tame them here.",
  "One minute inside > one hour of guilt outside.",
  "Side quest: open app. Main quest: do literally one thing.",
  "You’re one tap from ‘I did something today’.",
  "Inbox is loud. LockIN is signal. Choose signal.",
  "Perfection left. Progress is here. Open the door.",
  "AFK from goals detected. Reconnect inside.",
  "Your streak is hanging by a thread. Bring scissors for excuses.",
  "Tap to disappoint your inner hater.",
  "Open LockIN. Make your bedtime proud.",
  "Draft ugly. Check pretty. Repeat.",
  "Your brain cache needs a hit. App inside.",
  "We found your focus. It’s behind this push.",
  "The task goblin stole your peace. Come steal it back.",
  "Lock in now; flex later.",
  "Tiny action > giant spiral. Choose tiny action.",
  "Future you is refreshing. Give them an update.",
  "Your goals are doing the awkward hover. Let them sit.",
  "Streak armor is slipping. Strap it back on.",
  "Return to app. Evict chaos with one checkbox.",
  "Your motivation is a rare spawn. It’s here. Tap.",
  "Stop letting tasks build lore. Resolve the conflict.",
  "The couch is not a productivity tool. We are. Tap.",
  "Your roadmap misses your toxic consistency. Come back.",
  "Be unreasonably disciplined for 120 seconds. Start here.",
  "Open LockIN and bully a task into submission.",
  "You’re one check away from smug silence.",
  "‘Someday’ texted. We replied with this notification.",
  "Make a micro-move before the overthink boss spawns.",
  "Return to app. Close one loop. Breathe.",
  "Don’t rehearse failure; rehearse tapping this.",
  "Clout fades. Checkmarks don’t. Collect one.",
  "Your excuses are cosplaying productivity. Unmask them.",
  "Tap in. Convert dread into ‘done’.",
  "If it takes <2 min, it’s late. Fix that.",
  "Momentum coupon inside: 100% off anxiety (limited time).",
  "Your to-do said ‘u up?’. Text: ‘opening LockIN’.",
  "Skip the vibe check; run the progress check.",
  "Be the villain to your procrastination arc.",
  "Open app → do tiny thing → forget guilt.",
  "Your attention sprint starts at the home screen.",
  "The only thing between you and peace is a tap.",
  "Don’t let the day end on a cliffhanger. Resolve scene.",
  "Tap here to make tomorrow kinder.",
  "Re-enter the arena. Warm-up round available.",
  "Brain lag detected. Patch available: LockIN.",
  "Open LockIN. Pet the streak. Do one rep.",
  "Your goals said ‘boo’. Say ‘boo back’ in the app.",
  "We brought the ‘start’ button to you. Press it.",
  "Return to app. Make reality slightly less chaotic.",
  "Ship something mid. Mid shipped > perfect pending.",
  "Open. Nudge. Done. That’s the whole plot.",
  "Streak Jenga tower wobbling. Add a block.",
  "Your discipline just pinged: ‘revive me’.",
  "Tap for a micro-win. Blink and it’s logged.",
  "LockIN is typing… add your progress.",
  "Your inner critic hates when you open this. Do it.",
  "Resume your main character arc in 3…2…tap.",
  "One tap to exit the shame spiral.",
  "Your goals aren’t clingy; they’re committed. Meet them halfway.",
  "Your roadmap queued the next step. Accept?",
  "Open LockIN. Farm XP. Level: Peaceful.",
  "The longer you wait, the worse the lore. Cut scene now.",
  "Tap back in. Your grit left snacks.",
  "Close the app gap. Reclaim the day.",
  "Return to app. Make ‘later’ jealous.",
  "Your ‘tomorrow me’ needs a favor. Handle it today.",
  "Open for a tiny victory royale.",
  "Reminder: micro-progress is content your brain likes.",
  "We cached your momentum. Come retrieve it.",
  "A single checkbox could end three tabs of stress.",
  "Tap, check, exhale. It’s that simple.",
  "Play offense against procrastination. Ball’s here.",
  "Your timeline wants a plot twist, not a plot hole.",
  "Be petty. Succeed quietly. Reopen LockIN.",
  "Open the app. Upgrade your mood firmware.",
];

// Request notification permissions
export async function requestNotificationPermissions() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "LockIN Motivation",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6366F1",
      sound: true,
      enableVibrate: true,
      showBadge: true,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return false;
    }

    if (Platform.OS === "ios") {
      await Notifications.setBadgeCountAsync(0);
    }

    return true;
  } else {
    console.log("Must use physical device for Push Notifications");
    return false;
  }
}

// Get random message from the array
function getRandomMessage() {
  const randomIndex = Math.floor(Math.random() * Messages.length);
  return Messages[randomIndex];
}

// Schedule a single notification
async function scheduleNotification(title, body, trigger, identifier) {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: "#6366F1",
        ...(Platform.OS === "ios" && {
          badge: 1,
          categoryIdentifier: "MOTIVATION",
        }),
      },
      trigger,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
  }
}

// Schedule notifications for specific times (9AM, 1PM, 5PM, 9PM)
export async function scheduleRecurringNotifications() {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Define notification times (24-hour format)
    const notificationTimes = [
      { hour: 9, minute: 0, id: "morning" }, // 9:00 AM
      { hour: 13, minute: 0, id: "afternoon" }, // 1:00 PM
      { hour: 17, minute: 0, id: "evening" }, // 5:00 PM
      { hour: 21, minute: 0, id: "night" }, // 9:00 PM
      { hour: 23, minute: 0, id: "late_night" }, // 11:00 PM
      
    ];

    // Schedule daily notifications
    for (const time of notificationTimes) {
      await scheduleNotification(
        "LockIN 🚀",
        getRandomMessage(),
        {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        },
        `daily_${time.id}`
      );
    }

    // Schedule random notifications between main times
    await scheduleRandomMotivationNotification();

    console.log("✅ All notifications scheduled successfully!");
    return true;
  } catch (error) {
    console.error("Error setting up notifications:", error);
    return false;
  }
}

// Schedule additional random motivation notifications
async function scheduleRandomMotivationNotification() {
  try {
    // Schedule random notifications every 3-4 hours with some variance
    const randomTimes = [
      { hour: 11, minute: 30, id: "random1" }, // 11:30 AM
      { hour: 15, minute: 30, id: "random2" }, // 3:30 PM
      { hour: 19, minute: 30, id: "random3" }, // 7:30 PM
      { hour: 23, minute: 0, id: "random4" }, // 11:00 PM
    ];

    for (const time of randomTimes) {
      // Add some randomness (±30 minutes)
      const randomOffset = Math.floor(Math.random() * 60) - 30;
      let finalMinute = time.minute + randomOffset;
      let finalHour = time.hour;

      // Handle minute overflow/underflow
      if (finalMinute >= 60) {
        finalMinute -= 60;
        finalHour += 1;
      } else if (finalMinute < 0) {
        finalMinute += 60;
        finalHour -= 1;
      }

      // Ensure hour stays within bounds
      finalHour = Math.max(0, Math.min(23, finalHour));

      await scheduleNotification(
        "Quick Check! 💪",
        getRandomMessage(),
        {
          hour: finalHour,
          minute: finalMinute,
          repeats: true,
        },
        `random_${time.id}`
      );
    }
  } catch (error) {
    console.error("Error scheduling random notifications:", error);
  }
}

// Function to manually trigger a test notification
export async function sendTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "LockIN Test 🧪",
        body: "Your notification system is working perfectly!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: "#6366F1",
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
  }
}
