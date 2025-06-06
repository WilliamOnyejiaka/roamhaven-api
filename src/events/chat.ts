import { Chat } from "../namespaces";
import { ChatHandler } from "../handlers";

const chat = new Chat();

chat.onConnection(ChatHandler.onConnection.bind(ChatHandler));
chat.register("sendMessage", ChatHandler.sendMessage.bind(ChatHandler));
chat.register("loadChats", ChatHandler.loadChats.bind(ChatHandler));
chat.register("loadMessages", ChatHandler.loadMessages.bind(ChatHandler));


export default chat;
