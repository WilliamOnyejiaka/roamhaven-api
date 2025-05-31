import { Chat } from "../namespaces";
import { ChatHandler } from "../handlers";

const chat = new Chat();

chat.onConnection(ChatHandler.onConnection.bind(ChatHandler));
chat.register("sendMessage", ChatHandler.sendMessage.bind(ChatHandler));

export default chat;
