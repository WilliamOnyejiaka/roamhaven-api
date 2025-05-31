import { IMessage, MessageModel } from "../schemas/Message";
import Model from "./bases/Model";

export default class Message extends Model<IMessage> {

    public constructor() {
        super(MessageModel);
    }
}