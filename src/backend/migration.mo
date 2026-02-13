import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  // Types from old actor state
  type ServiceCategory = {
    #inStore;
    #online;
  };

  type ImageType = {
    #hero;
    #gallery;
    #logo;
    #service;
    #contactBackground;
  };

  type AspectRatioOption = {
    #original;
    #square;
    #portrait;
    #landscape;
  };

  type ProcessedImage = {
    id : Nat;
    image : ?Storage.ExternalBlob;
    description : Text;
    uploadTime : Time.Time;
    sortOrder : Nat;
    aspectRatio : AspectRatioOption;
    fileSizeBytes : Nat;
    optimizedUrl : ?Text;
    imageType : ImageType;
    originalWidth : ?Nat;
    originalHeight : ?Nat;
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?ProcessedImage;
    category : ServiceCategory;
    isActive : Bool;
  };

  type StoreServiceCategory = {
    #selfService;
    #operatorService;
  };

  type StoreSubcategoryService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?ProcessedImage;
    subcategory : StoreServiceCategory;
    isActive : Bool;
  };

  type OldActor = {
    services : Map.Map<Nat, Service>;
    inStoreSubcategoryServices : Map.Map<Nat, StoreSubcategoryService>;
    imageDescriptions : Map.Map<Nat, ProcessedImage>;
    nextServiceId : Nat;
    nextImageDescriptionId : Nat;
    nextGalleryImageId : Nat;
  };

  // Types for new ImageType #photoBackground
  type NewImageType = {
    #hero;
    #gallery;
    #logo;
    #service;
    #contactBackground;
    #photoBackground;
  };

  type NewProcessedImage = {
    id : Nat;
    image : ?Storage.ExternalBlob;
    description : Text;
    uploadTime : Time.Time;
    sortOrder : Nat;
    aspectRatio : AspectRatioOption;
    fileSizeBytes : Nat;
    optimizedUrl : ?Text;
    imageType : NewImageType;
    originalWidth : ?Nat;
    originalHeight : ?Nat;
  };

  type NewService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?NewProcessedImage;
    category : ServiceCategory;
    isActive : Bool;
  };

  type NewStoreSubcategoryService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?NewProcessedImage;
    subcategory : StoreServiceCategory;
    isActive : Bool;
  };

  type NewActor = {
    services : Map.Map<Nat, NewService>;
    inStoreSubcategoryServices : Map.Map<Nat, NewStoreSubcategoryService>;
    imageDescriptions : Map.Map<Nat, NewProcessedImage>;
    nextServiceId : Nat;
    nextImageDescriptionId : Nat;
    nextGalleryImageId : Nat;
    photoBackgroundImage : ?Storage.ExternalBlob;
  };

  public func run(old : OldActor) : NewActor {
    // Convert old ProcessedImage to new ProcessedImage with NewImageType
    let newImageDescriptions = old.imageDescriptions.map<Nat, ProcessedImage, NewProcessedImage>(
      func(_id, oldImg) {
        let newImageType : NewImageType = switch (oldImg.imageType) {
          case (#hero) { #hero };
          case (#gallery) { #gallery };
          case (#logo) { #logo };
          case (#service) { #service };
          case (#contactBackground) { #contactBackground };
        };
        { oldImg with imageType = newImageType };
      }
    );

    // Convert old Service to new Service with NewProcessedImage for image
    let newServices = old.services.map<Nat, Service, NewService>(
      func(_id, oldService) {
        let convertedImage = switch (oldService.image) {
          case (null) { null };
          case (?img) {
            let newImageType : NewImageType = switch (img.imageType) {
              case (#hero) { #hero };
              case (#gallery) { #gallery };
              case (#logo) { #logo };
              case (#service) { #service };
              case (#contactBackground) { #contactBackground };
            };
            ?{ img with imageType = newImageType };
          };
        };
        { oldService with image = convertedImage };
      }
    );

    // Convert old StoreSubcategoryService to new StoreSubcategoryService with updated ProcessedImage
    let newInStoreSubcategoryServices = old.inStoreSubcategoryServices.map<Nat, StoreSubcategoryService, NewStoreSubcategoryService>(
      func(_id, oldService) {
        let convertedImage = switch (oldService.image) {
          case (null) { null };
          case (?img) {
            let newImageType : NewImageType = switch (img.imageType) {
              case (#hero) { #hero };
              case (#gallery) { #gallery };
              case (#logo) { #logo };
              case (#service) { #service };
              case (#contactBackground) { #contactBackground };
            };
            ?{ img with imageType = newImageType };
          };
        };
        { oldService with image = convertedImage };
      }
    );

    // Initialize the new photoBackgroundImage field to null
    {
      old with
      services = newServices;
      inStoreSubcategoryServices = newInStoreSubcategoryServices;
      imageDescriptions = newImageDescriptions;
      photoBackgroundImage = null;
    };
  };
};
