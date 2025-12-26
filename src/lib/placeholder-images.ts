import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type StationeryDesign = {
    id: string;
    name: string;
    category: string;
    imageUrl: string;
}

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
export const VendorSpecialties: string[] = data.vendorSpecialties;
export const StationeryDesigns: StationeryDesign[] = data.stationeryDesigns;
