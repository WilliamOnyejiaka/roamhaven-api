import { INotification, NotificationModel } from "../schemas/Notification";
import Model from "./bases/Model";


export default class Notification extends Model<INotification> {

    public constructor(){
        super(NotificationModel);
    }
}