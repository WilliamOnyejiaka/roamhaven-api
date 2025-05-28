import BaseService from "./bases/BaseService";
import { Listing as ListingRepo } from "../repos";
import { ListingDto, MapListingDto } from "../types/dtos";
import axios from "axios";
import Cloudinary from "./Cloudinary";
import { CdnFolders, ResourceType } from "../types/enums";

export default class Listing extends BaseService<ListingRepo> {

    public constructor() {
        super(new ListingRepo());
    }

    public async geocodeAddress(address: string) {
        const accessToken = "pk.eyJ1Ijoia2VsZWNoaS1kZXYxIiwiYSI6ImNsajRieGdlcDAwdHAzZW81MjJwN3EyY2EifQ.NkhwU75N2a-6Ik9feG4IWA";
        const query = encodeURIComponent(address);
        try {
            const response = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${accessToken}`
            );
            if (response.data.features && response.data.features.length > 0) {
                const [longitude, latitude] = response.data.features[0].center;
                return { error: false, latitude, longitude };
            }
            return { error: true, latitude: 0, longitude: 0 }; // Default to 0 if geocoding fails
        } catch (err: any) {
            console.error("Geocoding failed:", err.message);
            return { error: true, latitude: 0, longitude: 0 };
        }
    };

    public async createListing(listingDto: ListingDto, listingPhotos: Express.Multer.File[]) {
        const address = `${listingDto.streetAddress}${listingDto.aptSuite ? `, ${listingDto.aptSuite}` : ''}, ${listingDto.city}, ${listingDto.province}, ${listingDto.country}`;
        const coordinates = await this.geocodeAddress(address);
        if (coordinates.error) return super.responseData(500, true, "Failed to get listings coordinates");
        listingDto.latitude = coordinates.latitude;
        listingDto.longitude = coordinates.longitude;

        const cloudinary = new Cloudinary();

        const { uploadedFiles, failedFiles, publicIds } = await cloudinary.upload(listingPhotos, ResourceType.IMAGE, CdnFolders.LISTINGPHOTOS);
        const medias = uploadedFiles.map(media => {
            return {
                mimeType: media.mimeType,
                imageUrl: media.url,
                publicId: media.publicId,
                size: media.size,
            }
        });

        if (failedFiles.length > 0) return super.responseData(500, true, "Error processing images");

        const repoResult = await this.repo!.insert(listingDto, medias);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(201, false, "Listing has been uploaded successfully", repoResult.data);
    }

    public async getWithId(id: number) {
        const repoResult = await this.repo!.getWithId(id);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, false, "Listings were gotten successfully", repoResult.data);
    }

    public async paginateByCategory(category: string, page: number, limit: number) {
        const { skip, take } = super.skipTake(page, limit);
        const repoResult = await this.repo!.paginateByCategory(category, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = this.getPagination(page, limit, totalRecords);
        return super.responseData(200, false, "Items were retrieved successfully", { items: data.items, pagination });
    }

    public async paginateListings(page: number, limit: number) {
        const { skip, take } = super.skipTake(page, limit);
        const repoResult = await this.repo!.paginateListings(skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = this.getPagination(page, limit, totalRecords);
        return super.responseData(200, false, "Items were retrieved successfully", { items: data.items, pagination });
    }

    public async searchTitle(search: string, page: number, limit: number) {
        const { skip, take } = super.skipTake(page, limit);
        const repoResult = await this.repo!.searchTitle(search, skip, take);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        const data = repoResult.data as any;
        const totalRecords = data.totalItems;
        const pagination = this.getPagination(page, limit, totalRecords);
        return super.responseData(200, false, "Items were retrieved successfully", { items: data.items, pagination });
    }

    public async mapListings(mapListingDto: MapListingDto) {
        const repoResult = await this.repo!.mapListings(mapListingDto);
        const repoResultError = this.handleRepoError(repoResult);
        if (repoResultError) return repoResultError;
        return super.responseData(200, false, "Items were retrieved successfully", repoResult.data);
    }
}