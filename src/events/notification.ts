import { Notification } from "../namespaces";
import { NotificationHandler } from "../handlers";

const notification = new Notification();

notification.onConnection(NotificationHandler.onConnection.bind(NotificationHandler));

export default notification;
