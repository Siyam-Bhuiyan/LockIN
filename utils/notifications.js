import * as Notifications from "expo-notifications";

const funnyMessages = [
  "Don't forget to LockIN your progress today!",
  "Procrastination is a myth. You just need a snack break!",
  "You’re one step closer to being a productivity legend.",
  "Remember: Even small progress is progress!",
  "Streaks are cool. So are you!",
  "Varsity projects won’t finish themselves. Go get 'em!",
  "Learning never stops. Neither should you!",
  "CP problems fear you. Show them who's boss!",
  "Roadmaps are meant to be conquered!",
];

export async function sendMotivationNotification() {
  const message =
    funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "LockIN Reminder",
      body: message,
    },
    trigger: { seconds: 2 },
  });
}

export async function sendDeadlineNotification(task) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Task Deadline: ${task.title}`,
      body: `Due: ${task.deadline}. Don't forget to finish it!`,
    },
    trigger: { seconds: 2 },
  });
}
