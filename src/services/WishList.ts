import BaseService from "./bases/BaseService";
import { WishList as WishListRepo, Listing } from "../repos";
import { WishListDto } from "../types/dtos";

export default class WishList extends BaseService<WishListRepo> {

    private readonly listingRepo = new Listing();

    public constructor() {
        super(new WishListRepo());
    }

    public async add(wishListDto: WishListDto) {
        const listingExists = await this.listingRepo.getWithId(wishListDto.listingId);
        const listingExistsError = this.handleRepoError(listingExists);

        if (listingExistsError) return listingExistsError;
        if (!listingExists.data) return super.responseData(404, true, "Listing was not found");

        const hostId = listingExists.data.userId;
        if (wishListDto.userId == hostId) return super.responseData(400, true, "User cannot add their listing to wish list");

        const repoResult = await this.repo!.insertWishList(wishListDto);
        const repoResultError = super.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(201, false, "Listing was added", repoResult.data);
    }

    public async wishList(userId: number, page: number, limit: number) {
        const { skip, take } = super.skipTake(page, limit);
        const repoResult = await this.repo!.wishList(userId, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = this.getPagination(page, limit, totalRecords);
        return super.responseData(200, false, "Items were retrieved successfully", { items: data.items, pagination });
    }
}