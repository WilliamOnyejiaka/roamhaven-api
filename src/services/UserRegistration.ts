import { UserCache } from "../cache";
import { env, streamRouter } from "../config";
import { http, HttpStatus } from "../constants";
import { UserDto } from "../types/dtos";
import { CipherUtility, parseJson, Password } from "../utils";
import { Cloudinary, Token } from ".";
import Authentication from "./Authentication";


export default class UserRegistration extends Authentication {

    public constructor() {
        super();
    }

   

    // public async signUp(userDto: UserDto) {
    //     const passwordHash: string = Password.hashPassword(userDto.password!, this.storedSalt);
    //     userDto.password = passwordHash;

    //     const repoResult = await this.repo.insert(userDto);

    //     const error: boolean = repoResult.error
    //     const statusCode = repoResult.type;
    //     const message: string = !error ? "User has been created successfully" : repoResult.message!;

    //     if (!error) {
    //         const result = repoResult.data!;
    //         delete (result as UserDto).password;
    //         const cacheSuccessful = await this.cache.set(
    //             (result as UserDto).id!,
    //             result as UserDto
    //         );

    //         return cacheSuccessful ? super.responseData(statusCode, error, message, {
    //             token: Token.createToken(env('tokenSecret')!, { id: result.id }, [UserType.USER]), // TODO: remove tokenSecret env from all methods
    //             user: result
    //         }) : super.responseData(statusCode, error, message);
    //     }
    //     return super.responseData(statusCode, error, message);
    // }

    // public async adminSignUp(signUpData: { // TODO: cache admin after registration
    //     firstName: string,
    //     lastName: string,
    //     email: string,
    //     active: boolean,
    //     phoneNumber: string,
    //     key?: string,
    //     roleId?: number
    // }) {
    //     const keyCache = new AdminKey();
    //     const cacheResult = await keyCache.get(signUpData.key!);

    //     if (cacheResult.error) {
    //         return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
    //     }

    //     if (!cacheResult.data) {
    //         return super.responseData(HttpStatus.NOT_FOUND, true, "Key not found");
    //     }

    //     const decryptResult = CipherUtility.decrypt(signUpData.key!, this.secretKey);
    //     if (decryptResult.error) {
    //         return super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
    //     }

    //     const decodedJson = parseJson(decryptResult.originalText!);
    //     if (decodedJson.error) {
    //         return super.responseData(HttpStatus.BAD_REQUEST, true, decodedJson.message);
    //     }

    //     const keyDetails = decodedJson.data;
    //     delete signUpData.key;
    //     signUpData.roleId = keyDetails.roleId;

    //     const serviceResult = await (new AdminService()).createAdmin(signUpData as any, keyDetails.createdBy); //  TODO: create user token
    //     return serviceResult;
    // }

}