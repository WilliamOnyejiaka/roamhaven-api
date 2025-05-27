import { UserCache, TokenBlackList } from "../cache";
import { env } from "../config";
import { } from "../repos";
import UserRepo from "../repos/UserRepo";
import Token from "./Token";
import { Cloudinary } from ".";
import BaseService from "./bases/BaseService";
import { CdnFolders, ResourceType, StreamGroups, UserType, OTPType } from "../types/enums";
import { UploadedFiles, FailedFiles } from "../types";
import { UserDto } from "../types/dtos";
import { CipherUtility, parseJson, Password } from "../utils";
import constants, { HttpStatus, http } from "./../constants";
import { OTP } from ".";


export default class Authentication extends BaseService {

    protected readonly storedSalt: string = env("storedSalt")!;
    protected readonly tokenSecret: string = env('tokenSecret')!;
    protected readonly secretKey: string = env('secretKey')!;
    protected readonly cache: UserCache = new UserCache();
    protected readonly tokenBlackListCache: TokenBlackList = new TokenBlackList();
    protected readonly repo: UserRepo = new UserRepo();

    public constructor() {
        super();
    }

    public async signUp(userDto: UserDto, file?: Express.Multer.File) {
        const cloudinary = new Cloudinary();
        let uploadedFiles: UploadedFiles[] = [], publicIds: string[] = [], failedFiles: FailedFiles[] = [];
        if (file) {
            ({ uploadedFiles, failedFiles, publicIds } = await cloudinary.upload([file], ResourceType.IMAGE, CdnFolders.PROFILEPICTURE));
            if (failedFiles?.length) {
                return this.responseData(400, true, "File upload failed", failedFiles);
            }
        }

        const passwordHash = Password.hashPassword(userDto.password!, this.storedSalt);
        userDto.password = passwordHash;

        const repoResult = file ? await this.repo.insertWithImage(userDto, uploadedFiles[0]) : await this.repo.insert(userDto);
        const error = repoResult.error;
        const statusCode = repoResult.type;
        const message = !error ? "User has been created successfully" : repoResult.message;
        if (error) {
            if (file) await cloudinary.deleteFiles(publicIds);
            return super.responseData(statusCode, error, message);
        }
        const result = repoResult.data;
        if (file) result['profilePicture'] = result['profilePicture'][0].imageUrl;

        delete result.password;
        const cacheSuccessful = await this.cache.set(
            Number(result.id),
            result
        );

        return cacheSuccessful ? super.responseData(statusCode, error, message, {
            token: Token.createToken(env('tokenSecret')!, { id: result.id }, [UserType.USER]),
            user: result
        }) : super.responseData(statusCode, error, message);
    }

    public async login(logInDetails: { email: string, password: string }) {
        const repoResult = await this.repo.getUserProfileWithEmail(logInDetails.email);

        const errorResponse = super.handleRepoError(repoResult);
        if (errorResponse) return errorResponse;

        const user = repoResult.data;

        if (user) {
            const hashedPassword = user.password;
            const validPassword = Password.compare(logInDetails.password, hashedPassword, this.storedSalt);

            if (validPassword) {
                user.profilePictureUrl = user[this.repo.imageRelation].length !== 0 ? user[this.repo.imageRelation][0].imageUrl : null;
                delete user[this.repo.imageRelation];
                delete user.password;
                const cacheSuccessful = await this.cache.set(
                    Number(user.id),
                    user
                );

                const token = this.generateUserToken(user.id, UserType.USER);

                return cacheSuccessful ? super.responseData(200, false, "Login was successful", {
                    token: token,
                    user: user
                }) : super.responseData(HttpStatus.INTERNAL_SERVER_ERROR, true, http(HttpStatus.INTERNAL_SERVER_ERROR.toString())!);
            }
            return super.responseData(HttpStatus.BAD_REQUEST, true, "Invalid password");
        }
        return super.responseData(HttpStatus.NOT_FOUND, true, constants("404User")!);
    }

    public async sendUserOTP(email: string, otpType: OTPType, userType: UserType) {
        const repoResult = await this.repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            const userName = userProfile.firstName + " " + userProfile.lastName;
            const otpService = new OTP(userProfile.email, otpType, userType);
            const otpServiceResult = await otpService.send(userName);
            return otpServiceResult
        }

        return super.responseData(404, true, constants('404User')!);
    }

    public async emailVerification(email: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.VERIFICATION, userType);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const updatedResult = await this.repo.updateVerifiedStatus(email);
        const updatedResultError = this.handleRepoError(updatedResult);
        if (updatedResultError) return updatedResultError;

        const repoResult = await this.repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            this.setUserProfilePicture(userProfile);
            delete userProfile.password;
            delete userProfile[this.repo.imageRelation];

            const cacheSuccessful = await this.cache.set(
                userProfile.id,
                userProfile
            );

            return cacheSuccessful ? super.responseData(200, false, otpServiceResult.json.message, {
                token: userType === "admin" ? this.generateAdminToken(userProfile) : this.generateUserToken(userProfile.id, userType),
                vendor: userProfile
            }) : super.responseData(500, true, http('500')!);
        }
        return super.responseData(404, true, constants('404User')!);
    }

    public async otpConfirmation(email: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.RESET, userType);

        const otpServiceResult = await otp.confirmOTP(otpCode);
        if (otpServiceResult.json.error) return otpServiceResult;
        const deletedOTPServiceResult = await otp.deleteOTP();
        if (deletedOTPServiceResult.json.error) return deletedOTPServiceResult;

        const token = this.generateOTPToken(email, userType);
        return super.responseData(200, false, "OTP confirmation was successful", { token: token });
    }


    public async passwordReset(email: string, password: string, otpCode: string, userType: UserType) {
        const otp = new OTP(email, OTPType.RESET, userType);
        const otpServiceResult = await otp.confirmOTP(otpCode);

        if (otpServiceResult.json.error) return otpServiceResult;

        const deletedOTPServiceResult = await otp.deleteOTP();

        if (deletedOTPServiceResult.json.error) {
            return deletedOTPServiceResult;
        }

        const hashedPassword = Password.hashPassword(password, this.storedSalt);
        const updatedResult = await this.repo.updatePassword(email, hashedPassword);
        const updatedResultError = this.handleRepoError(updatedResult);
        if (updatedResultError) return updatedResultError;

        const repoResult = await this.repo.getUserProfileWithEmail(email);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;

        const userProfile = repoResult.data;

        if (userProfile) {
            this.setUserProfilePicture(userProfile);
            delete userProfile.password;
            delete userProfile[this.repo.imageRelation];

            return super.responseData(200, false, "Password has been reset successfully");
        }
        return super.responseData(404, true, constants('404User')!);
    }

    public async logOut(token: string) {
        const tokenValidationResult: any = Token.validateToken(token, ["any"], this.tokenSecret);

        if (tokenValidationResult.error) {
            return super.responseData(400, true, tokenValidationResult.message);
        }

        const decoded = Token.decodeToken(token);
        const blacklisted = await this.tokenBlackListCache.set(token, { data: decoded.data, types: decoded.types }, decoded.expiresAt);

        return blacklisted ?
            super.responseData(200, false, "User has been logged out successfully") :
            super.responseData(500, true, http('500')!);
    }

    private generateToken(data: any, role: string, expiresIn: string = "30d") {
        return Token.createToken(this.tokenSecret, data, [role], expiresIn);
    }

    protected generateOTPToken(email: string, role: string, expiresIn: string = "5m") {
        return this.generateToken({ email: email }, role, expiresIn);
    }

    protected generateUserToken(userId: number, role: UserType) {
        return this.generateToken({ id: userId }, role);
    }

    protected generateAdminToken(admin: any) {
        return this.generateToken(admin, "admin");
    }

    protected setUserProfilePicture(userProfile: any) {
        userProfile.profilePictureUrl = userProfile[this.repo.imageRelation].length != 0 ? userProfile[this.repo.imageRelation][0].imageUrl : null;
    }
}