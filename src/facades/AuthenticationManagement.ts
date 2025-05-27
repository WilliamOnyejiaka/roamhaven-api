import UserRegistration from "../services/UserRegistration";
import { UserDto } from "../types/dtos";

export default class AuthenticationManagement {

    private readonly registrationService = new UserRegistration();

    public async signUp(userDto: UserDto, file?: Express.Multer.File) {
        return await this.registrationService.signUp(userDto, file);
    }
}