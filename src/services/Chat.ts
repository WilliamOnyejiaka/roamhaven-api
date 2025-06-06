import BaseService from "./bases/BaseService";
import { Chat as ChatRepo } from "../repos";

export default class Chat extends BaseService<ChatRepo> {

    public constructor(){
        super(new ChatRepo());
    }

    public chat(){}
}