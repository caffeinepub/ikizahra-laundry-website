import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  // Authentication state
  let accessControlState = AccessControl.initState();

  // Authentication and authorization endpoints
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    phoneNumber : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type ServiceCategory = {
    #inStore;
    #online;
  };

  public type ImageType = {
    #hero;
    #gallery;
    #logo;
    #service;
    #contactBackground;
  };

  public type AspectRatioOption = {
    #original;
    #square;
    #portrait;
    #landscape;
  };

  public type ProcessedImage = {
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

  public type Service = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?ProcessedImage;
    category : ServiceCategory;
    isActive : Bool;
  };

  public type ContactFormEntry = {
    id : Nat;
    name : Text;
    phone : Text;
    message : Text;
    timestamp : Time.Time;
  };

  public type ContactInfo = {
    phone : Text;
    whatsapp : Text;
    address : Text;
    hours : Text;
  };

  public type BannerInfo = {
    name : Text;
    message : Text;
    image : ?Storage.ExternalBlob;
  };

  public type StoreServiceCategory = {
    #selfService;
    #operatorService;
  };

  public type StoreSubcategoryService = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    image : ?ProcessedImage;
    subcategory : StoreServiceCategory;
    isActive : Bool;
  };

  public type PatternType = {
    #bubbles;
    #fabricTexture;
    #waterRipples;
  };

  public type BackgroundTheme = {
    pattern : PatternType;
    baseColor : Text;
    transparencyLevel : Nat;
    patternIntensity : Nat;
  };

  public type GradientConfig = {
    startColor : Text;
    endColor : Text;
    intensity : Nat;
    direction : Text;
  };

  public type ColorHarmony = {
    primary : Text;
    secondary : Text;
    accent : Text;
  };

  public type ThemeConfig = {
    gradients : [GradientConfig];
    colorHarmony : ColorHarmony;
    luxuryPreset : Bool;
    harmonyLevel : Nat;
  };

  public type TypographyConfig = {
    fontFamily : Text;
    fontWeight : Text;
    fontSize : Nat;
    letterSpacing : Nat;
  };

  public type ShadowConfig = {
    color : Text;
    offsetX : Int;
    offsetY : Int;
    blurRadius : Nat;
  };

  public type TextureConfig = {
    patternType : Text;
    intensity : Nat;
    scale : Nat;
    colorOverlay : Text;
  };

  public type LayoutConfig = {
    padding : Nat;
    margin : Nat;
    alignment : Text;
    borderRadius : Nat;
  };

  public type ResponsiveConfig = {
    mobileFontSize : Nat;
    tabletFontSize : Nat;
    desktopFontSize : Nat;
    mobilePadding : Nat;
    tabletPadding : Nat;
    desktopPadding : Nat;
  };

  public type HeaderStyleConfig = {
    typography : ?TypographyConfig;
    gradient : ?GradientConfig;
    shadow : ?ShadowConfig;
    texture : ?TextureConfig;
    layout : ?LayoutConfig;
    responsive : ?ResponsiveConfig;
    colorHarmony : ?ColorHarmony;
    isResponsive : Bool;
  };

  public type ExtendedThemeConfig = {
    theme : ?ThemeConfig;
    headerStyle : ?HeaderStyleConfig;
    gradient : ?GradientConfig;
    colorHarmony : ?ColorHarmony;
    luxuryPreset : Bool;
    harmonyLevel : Nat; // Percentage 0-100
  };

  var nextServiceId = 1;
  var nextImageDescriptionId = 1;
  var nextContactFormId = 1;
  var nextGalleryImageId = 1;

  var contactInfo : ContactInfo = {
    phone = "6285716733929";
    whatsapp = "https://wa.me/6285716733929";
    address = "Jl. Cempaka Warna No. 26 RT 09 RW 04, Cempaka Putih, Jakarta Pusat";
    hours = "Senin - Sabtu: 08.00 - 20.00";
  };

  var themeConfig : ?ThemeConfig = ?{
    gradients = [
      {
        startColor = "#A6D8FF";
        endColor = "#CCF9E0";
        intensity = 80;
        direction = "topRight";
      },
      {
        startColor = "#F2DBC7";
        endColor = "#F4EDE3";
        intensity = 70;
        direction = "bottomLeft";
      },
    ];
    colorHarmony = {
      primary = "#3A85D6";
      secondary = "#61DCC7";
      accent = "#F4BB68";
    };
    luxuryPreset = true;
    harmonyLevel = 90;
  };

  let services = Map.empty<Nat, Service>();
  let inStoreSubcategoryServices = Map.empty<Nat, StoreSubcategoryService>();
  let imageDescriptions = Map.empty<Nat, ProcessedImage>();
  let contactEntries = Map.empty<Nat, ContactFormEntry>();
  var banner : ?BannerInfo = null;
  var backgroundTheme : BackgroundTheme = {
    pattern = #bubbles;
    baseColor = "#D6F6FF";
    transparencyLevel = 60;
    patternIntensity = 20;
  };

  var headerStyleConfig : ?HeaderStyleConfig = ?{
    typography = ?{
      fontFamily = "Roboto";
      fontWeight = "bold";
      fontSize = 28;
      letterSpacing = 2;
    };
    gradient = ?{
      startColor = "#2196F3";
      endColor = "#00BCD4";
      intensity = 80;
      direction = "topRight";
    };
    shadow = ?{
      color = "#383838";
      offsetX = 2;
      offsetY = 2;
      blurRadius = 5;
    };
    texture = null;
    layout = ?{
      padding = 16;
      margin = 16;
      alignment = "center";
      borderRadius = 8;
    };
    responsive = ?{
      mobileFontSize = 20;
      tabletFontSize = 24;
      desktopFontSize = 32;
      mobilePadding = 8;
      tabletPadding = 12;
      desktopPadding = 16;
    };
    colorHarmony = ?{
      primary = "#A6E3FF";
      secondary = "#B9F7E0";
      accent = "#FFE4BA";
    };
    isResponsive = true;
  };

  var extendedThemeConfig : ?ExtendedThemeConfig = ?{
    theme = ?{
      gradients = [
        {
          startColor = "#A6D8FF";
          endColor = "#CCF9E0";
          intensity = 80;
          direction = "topRight";
        },
        {
          startColor = "#F2DBC7";
          endColor = "#F4EDE3";
          intensity = 70;
          direction = "bottomLeft";
        },
      ];
      colorHarmony = {
        primary = "#3A85D6";
        secondary = "#61DCC7";
        accent = "#F4BB68";
      };
      luxuryPreset = true;
      harmonyLevel = 90;
    };
    headerStyle = headerStyleConfig;
    gradient = ?{
      startColor = "#B8EFFF";
      endColor = "#D0FFEE";
      intensity = 65;
      direction = "bottomRight";
    };
    colorHarmony = ?{
      primary = "#36A7E8";
      secondary = "#52E1BE";
      accent = "#FFD080";
    };
    luxuryPreset = true;
    harmonyLevel = 98;
  };

  /// PUBLIC API FOR CUSTOMER PHOTOS
  /// No authorization check - accessible to all users including anonymous/guests
  let customerPhotos = Map.empty<Nat, Storage.ExternalBlob>();
  var nextCustomerPhotoId = 1;

  public query ({ caller }) func getBackgroundTheme() : async BackgroundTheme {
    backgroundTheme;
  };

  public query ({ caller }) func getThemeConfig() : async ?ThemeConfig {
    themeConfig;
  };

  public query ({ caller }) func getHeaderStyleConfig() : async ?HeaderStyleConfig {
    headerStyleConfig;
  };

  public query ({ caller }) func getExtendedThemeConfig() : async ?ExtendedThemeConfig {
    extendedThemeConfig;
  };

  public query ({ caller }) func getGradients() : async [GradientConfig] {
    switch (themeConfig) {
      case (null) { [] };
      case (?theme) { theme.gradients };
    };
  };

  public query ({ caller }) func getColorHarmony() : async ?ColorHarmony {
    switch (themeConfig) {
      case (null) { null };
      case (?theme) { ?theme.colorHarmony };
    };
  };

  public query ({ caller }) func getTitleGradient() : async GradientConfig {
    { startColor = "#B8EFFF"; endColor = "#D0FFEE"; intensity = 65; direction = "bottomRight" };
  };

  public query ({ caller }) func getButtonGradient() : async GradientConfig {
    { startColor = "#36A7E8"; endColor = "#52E1BE"; intensity = 80; direction = "horizontal" };
  };

  public shared ({ caller }) func setBackgroundTheme(bgTheme : BackgroundTheme) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Hanya admin yang dapat mengubah tema latar belakang");
    };
    backgroundTheme := bgTheme;
  };

  public shared ({ caller }) func setThemeConfig(config : ThemeConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update theme config");
    };
    themeConfig := ?config;
  };

  public shared ({ caller }) func setHeaderStyleConfig(config : HeaderStyleConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update header style config");
    };
    headerStyleConfig := ?config;
  };

  public shared ({ caller }) func setExtendedThemeConfig(config : ExtendedThemeConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update extended theme config");
    };
    extendedThemeConfig := ?config;
  };

  public shared ({ caller }) func createService(name : Text, description : Text, price : Nat, category : ServiceCategory) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create services");
    };

    if (name.isEmpty() or description.isEmpty()) {
      Runtime.trap("Nama dan deskripsi layanan harus diisi");
    };

    let nextId = services.size() + 1;
    let service : Service = {
      id = nextId;
      name;
      description;
      price;
      image = null;
      category;
      isActive = true;
    };
    services.add(nextId, service);
    nextId;
  };

  public shared ({ caller }) func createStoreSubcategoryService(name : Text, description : Text, price : Nat, subcategory : StoreServiceCategory) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create store subcategory services");
    };

    if (name.isEmpty() or description.isEmpty()) {
      Runtime.trap("Nama dan deskripsi layanan harus diisi");
    };

    let nextId = inStoreSubcategoryServices.size() + 1;
    let service : StoreSubcategoryService = {
      id = nextId;
      name;
      description;
      price;
      image = null;
      subcategory;
      isActive = true;
    };
    inStoreSubcategoryServices.add(nextId, service);
    nextId;
  };

  public shared ({ caller }) func updateService(id : Nat, name : Text, description : Text, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update services");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Layanan tidak ditemukan") };
      case (?service) {
        let updatedService = {
          id = service.id;
          name;
          description;
          price;
          image = service.image;
          category = service.category;
          isActive = service.isActive;
        };
        services.add(id, updatedService);
      };
    };
  };

  public shared ({ caller }) func updateStoreSubcategoryService(id : Nat, name : Text, description : Text, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update store subcategory services");
    };

    switch (inStoreSubcategoryServices.get(id)) {
      case (null) { Runtime.trap("Layanan tidak ditemukan") };
      case (?service) {
        let updatedService = {
          id = service.id;
          name;
          description;
          price;
          image = service.image;
          subcategory = service.subcategory;
          isActive = service.isActive;
        };
        inStoreSubcategoryServices.add(id, updatedService);
      };
    };
  };

  public shared ({ caller }) func updateServiceWithoutImage(id : Nat, name : Text, description : Text, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update services");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Layanan tidak ditemukan") };
      case (?service) {
        let updatedService = {
          id = service.id;
          name;
          description;
          price;
          image = null;
          category = service.category;
          isActive = service.isActive;
        };
        services.add(id, updatedService);
      };
    };
  };

  public shared ({ caller }) func updateStoreSubcategoryServiceWithoutImage(id : Nat, name : Text, description : Text, price : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update store subcategory services");
    };

    switch (inStoreSubcategoryServices.get(id)) {
      case (null) { Runtime.trap("Layanan tidak ditemukan") };
      case (?service) {
        let updatedService = {
          id = service.id;
          name;
          description;
          price;
          image = null;
          subcategory = service.subcategory;
          isActive = service.isActive;
        };
        inStoreSubcategoryServices.add(id, updatedService);
      };
    };
  };

  public shared ({ caller }) func deleteService(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete services");
    };

    if (not (services.containsKey(id))) {
      Runtime.trap("Layanan tidak ditemukan");
    };

    services.remove(id);
  };

  public shared ({ caller }) func deleteStoreSubcategoryService(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete store subcategory services");
    };

    if (not (inStoreSubcategoryServices.containsKey(id))) {
      Runtime.trap("Layanan tidak ditemukan");
    };

    inStoreSubcategoryServices.remove(id);
  };

  public query ({ caller }) func getService(id : Nat) : async ?Service {
    services.get(id);
  };

  public query ({ caller }) func getStoreSubcategoryService(id : Nat) : async ?StoreSubcategoryService {
    inStoreSubcategoryServices.get(id);
  };

  public query ({ caller }) func getAllServices() : async [Service] {
    services.values().toArray();
  };

  public query ({ caller }) func getAllStoreSubcategoryServices() : async [StoreSubcategoryService] {
    inStoreSubcategoryServices.values().toArray();
  };

  public query ({ caller }) func getServicesByCategory(category : ServiceCategory) : async [Service] {
    services.values().toArray().filter(func(s) { s.category == category });
  };

  public query ({ caller }) func getServicesByStoreSubcategory(subcategory : StoreServiceCategory) : async [StoreSubcategoryService] {
    inStoreSubcategoryServices.values().toArray().filter(func(s) { s.subcategory == subcategory });
  };

  public shared ({ caller }) func uploadProcessedServiceImage(
    id : Nat,
    image : ?Storage.ExternalBlob,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload images");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Layanan tidak ditemukan") };
      case (?service) {
        let processedImg = {
          id;
          image;
          description = service.name # " - " # service.description;
          uploadTime = Time.now();
          sortOrder = 0;
          aspectRatio;
          fileSizeBytes;
          optimizedUrl;
          imageType = #service;
          originalWidth = width;
          originalHeight = height;
        };

        let updatedService = {
          id = service.id;
          name = service.name;
          description = service.description;
          price = service.price;
          image = ?processedImg;
          category = service.category;
          isActive = service.isActive;
        };
        services.add(id, updatedService);
      };
    };
  };

  public shared ({ caller }) func uploadProcessedStoreSubcategoryServiceImage(
    id : Nat,
    image : ?Storage.ExternalBlob,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload images");
    };

    switch (inStoreSubcategoryServices.get(id)) {
      case (null) { Runtime.trap("Layanan tidak ditemukan") };
      case (?service) {
        let processedImg = {
          id;
          image;
          description = service.name # " - " # service.description;
          uploadTime = Time.now();
          sortOrder = 0;
          aspectRatio;
          fileSizeBytes;
          optimizedUrl;
          imageType = #service;
          originalWidth = width;
          originalHeight = height;
        };

        let updatedService = {
          id = service.id;
          name = service.name;
          description = service.description;
          price = service.price;
          image = ?processedImg;
          subcategory = service.subcategory;
          isActive = service.isActive;
        };
        inStoreSubcategoryServices.add(id, updatedService);
      };
    };
  };

  public query ({ caller }) func getAllProcessedImages() : async [ProcessedImage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all processed images");
    };
    imageDescriptions.values().toArray();
  };

  public shared ({ caller }) func uploadProcessedGalleryImage(
    image : ?Storage.ExternalBlob,
    desc : Text,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload images");
    };

    let newId = nextGalleryImageId;
    let processedImg : ProcessedImage = {
      id = newId;
      image;
      description = desc;
      uploadTime = Time.now();
      sortOrder = newId;
      aspectRatio;
      fileSizeBytes;
      optimizedUrl;
      imageType = #gallery;
      originalWidth = width;
      originalHeight = height;
    };

    imageDescriptions.add(newId, processedImg);
    nextGalleryImageId += 1;
    newId;
  };

  // New function to delete gallery image
  public shared ({ caller }) func deleteGalleryImage(imageId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete gallery images");
    };

    switch (imageDescriptions.get(imageId)) {
      case (null) { Runtime.trap("Image not found") };
      case (?_) {
        // Remove the image metadata from the map
        imageDescriptions.remove(imageId);
        ();
      };
    };
  };

  // New function to replace gallery image
  public shared ({ caller }) func replaceGalleryImage(
    imageId : Nat,
    newImage : ?Storage.ExternalBlob,
    desc : ?Text,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can replace gallery images");
    };

    switch (imageDescriptions.get(imageId)) {
      case (null) { Runtime.trap("Image not found") };
      case (?existingImage) {
        let updatedDesc = switch (desc) {
          case (null) { existingImage.description };
          case (?d) { d };
        };

        let updatedImage : ProcessedImage = {
          id = imageId;
          image = newImage;
          description = updatedDesc;
          uploadTime = Time.now();
          sortOrder = existingImage.sortOrder;
          aspectRatio;
          fileSizeBytes;
          optimizedUrl;
          imageType = #gallery;
          originalWidth = width;
          originalHeight = height;
        };

        imageDescriptions.add(imageId, updatedImage);
      };
    };
  };

  public shared ({ caller }) func uploadHeroImage(
    image : ?Storage.ExternalBlob,
    desc : Text,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload images");
    };

    let nextId = imageDescriptions.size() + 1;
    let processedImg : ProcessedImage = {
      id = nextId;
      image;
      description = desc;
      uploadTime = Time.now();
      sortOrder = 0;
      aspectRatio;
      fileSizeBytes;
      optimizedUrl;
      imageType = #hero;
      originalWidth = width;
      originalHeight = height;
    };

    imageDescriptions.add(nextId, processedImg);
    nextId;
  };

  public shared ({ caller }) func uploadLogoImage(
    image : ?Storage.ExternalBlob,
    desc : Text,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload images");
    };

    let nextId = imageDescriptions.size() + 1;
    let processedImg : ProcessedImage = {
      id = nextId;
      image;
      description = desc;
      uploadTime = Time.now();
      sortOrder = 0;
      aspectRatio;
      fileSizeBytes;
      optimizedUrl;
      imageType = #logo;
      originalWidth = width;
      originalHeight = height;
    };

    imageDescriptions.add(nextId, processedImg);
    nextId;
  };

  public shared ({ caller }) func updateImageDescription(id : Nat, newDesc : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update image descriptions");
    };

    switch (imageDescriptions.get(id)) {
      case (null) { Runtime.trap("Gambar tidak ditemukan") };
      case (?imgDesc) {
        let updatedDesc = {
          id = imgDesc.id;
          image = imgDesc.image;
          description = newDesc;
          uploadTime = imgDesc.uploadTime;
          sortOrder = imgDesc.sortOrder;
          aspectRatio = imgDesc.aspectRatio;
          fileSizeBytes = imgDesc.fileSizeBytes;
          optimizedUrl = imgDesc.optimizedUrl;
          imageType = imgDesc.imageType;
          originalWidth = imgDesc.originalWidth;
          originalHeight = imgDesc.originalHeight;
        };
        imageDescriptions.add(id, updatedDesc);
      };
    };
  };

  public shared ({ caller }) func uploadProcessedContactBackgroundImage(
    image : ?Storage.ExternalBlob,
    desc : Text,
    aspectRatio : AspectRatioOption,
    fileSizeBytes : Nat,
    optimizedUrl : ?Text,
    width : ?Nat,
    height : ?Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload images");
    };

    let nextId = imageDescriptions.size() + 1;
    let processedImg : ProcessedImage = {
      id = nextId;
      image;
      description = desc;
      uploadTime = Time.now();
      sortOrder = 0;
      aspectRatio;
      fileSizeBytes;
      optimizedUrl;
      imageType = #contactBackground;
      originalWidth = width;
      originalHeight = height;
    };

    imageDescriptions.add(nextId, processedImg);
    nextId;
  };

  public query ({ caller }) func getContactInfo() : async ContactInfo {
    contactInfo;
  };

  public shared ({ caller }) func updateContactInfo(phone : Text, whatsapp : Text, address : Text, hours : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update contact info");
    };

    contactInfo := {
      phone;
      whatsapp;
      address;
      hours;
    };
  };

  public shared ({ caller }) func submitContactForm(name : Text, phone : Text, message : Text) : async Nat {
    let entry : ContactFormEntry = {
      id = contactEntries.size() + 1;
      name;
      phone;
      message;
      timestamp = Time.now();
    };

    contactEntries.add(contactEntries.size() + 1, entry);
    contactEntries.size() + 1;
  };

  public query ({ caller }) func getContactFormEntry(id : Nat) : async ?ContactFormEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view contact form entries");
    };
    contactEntries.get(id);
  };

  public query ({ caller }) func getAllContactFormEntries() : async [ContactFormEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view contact form entries");
    };
    contactEntries.values().toArray();
  };

  public query ({ caller }) func getAllActiveServicesByCategory(category : ServiceCategory) : async [Service] {
    services.values().toArray().filter(func(s) { s.category == category and s.isActive });
  };

  public query ({ caller }) func getAllActiveStoreSubcategoryServicesBySubcategory(subcategory : StoreServiceCategory) : async [StoreSubcategoryService] {
    inStoreSubcategoryServices.values().toArray().filter(func(s) { s.subcategory == subcategory and s.isActive });
  };

  public query ({ caller }) func getOrderedGalleryImages() : async [ProcessedImage] {
    let imagesArray = imageDescriptions.values().toArray();
    imagesArray;
  };

  public query ({ caller }) func getImagesByType(imageType : ImageType) : async [ProcessedImage] {
    let imagesArray = imageDescriptions.values().toArray();
    imagesArray.filter(
      func(img) {
        img.imageType == imageType;
      }
    );
  };

  public shared ({ caller }) func setDemoState() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can set demo state");
    };

    let defaultOnlineServices = [
      {
        id = 1;
        name = "Cuci kering setrika (online)";
        description = "Layanan antar jemput laundry komplit dengan hasil terbaik";
        price = 25000;
        image = null;
        category = #online;
        isActive = true;
      },
      {
        id = 2;
        name = "Cuci kering (online)";
        description = "Cuci dan kering baju lewat kurir online";
        price = 30000;
        image = null;
        category = #online;
        isActive = true;
      },
      {
        id = 3;
        name = "Cuci kering lipat (online)";
        description = "Pakaian bersih, kering, dan langsung dirapikan";
        price = 35000;
        image = null;
        category = #online;
        isActive = true;
      },
    ];

    let defaultInStoreSubcategories = [
      {
        id = 1;
        name = "Softener";
        description = "Softener berkualitas untuk cucian lebih lembut";
        price = 1000;
        image = null;
        subcategory = #selfService;
        isActive = true;
      },
      {
        id = 2;
        name = "Deterjen";
        description = "Deterjen premium untuk hasil cucian maksimal";
        price = 1000;
        image = null;
        subcategory = #selfService;
        isActive = true;
      },
      {
        id = 3;
        name = "Cuci (self service)";
        description = "Cuci pakaian sendiri dengan alat modern";
        price = 10000;
        image = null;
        subcategory = #selfService;
        isActive = true;
      },
      {
        id = 4;
        name = "Kering (self service)";
        description = "Layanan pengeringan pakaian secara mandiri";
        price = 10000;
        image = null;
        subcategory = #selfService;
        isActive = true;
      },
      {
        id = 5;
        name = "Cuci kering (operator service)";
        description = "Layanan cuci dan pengeringan oleh operator profesional";
        price = 25000;
        image = null;
        subcategory = #operatorService;
        isActive = true;
      },
      {
        id = 6;
        name = "Cuci kering lipat";
        description = "Pakaian bersih, kering, dan langsung dirapikan";
        price = 30000;
        image = null;
        subcategory = #operatorService;
        isActive = true;
      },
    ];

    for (service in defaultOnlineServices.values()) {
      services.add(service.id, service);
    };
    for (service in defaultInStoreSubcategories.values()) {
      inStoreSubcategoryServices.add(service.id, service);
    };

    let defaultHeroImageIds = [1, 2, 3, 4];
    for (id in defaultHeroImageIds.values()) {
      let defaultHeroImage : ProcessedImage = {
        id;
        image = null;
        description = "Banner Mesin Cuci";
        uploadTime = Time.now();
        sortOrder = 0;
        aspectRatio = #portrait;
        fileSizeBytes = 0;
        optimizedUrl = null;
        imageType = #hero;
        originalWidth = null;
        originalHeight = null;
      };
      imageDescriptions.add(id, defaultHeroImage);
    };

    // Set demo contact background image
    let demoContactBackgroundImage : ProcessedImage = {
      id = 1;
      image = null;
      description = "Kirim Pesan - Banner Demo Kontak";
      uploadTime = Time.now();
      sortOrder = 0;
      aspectRatio = #landscape;
      fileSizeBytes = 0;
      optimizedUrl = null;
      imageType = #contactBackground;
      originalWidth = null;
      originalHeight = null;
    };
    imageDescriptions.add(1, demoContactBackgroundImage);
  };

  public query ({ caller }) func isDemoStateSet() : async Bool {
    services.containsKey(1) and imageDescriptions.containsKey(1);
  };

  public query ({ caller }) func isDemoModeActive() : async Bool {
    imageDescriptions.containsKey(1);
  };

  public shared ({ caller }) func uploadBanner(name : Text, message : Text, image : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can upload banners");
    };

    banner := ?{
      name;
      message;
      image;
    };
  };

  public query ({ caller }) func getBanner() : async ?BannerInfo {
    banner;
  };

  public query ({ caller }) func getStaticDescription() : async Text {
    "Laundry professional di Jakarta Pusat, Cempaka Putih. Layanan laundry profesional yang menyediakan cuci kering, cuci setrika, antar jemput, layanan express dan layanan self-service laundry dengan harga terjangkau di Jakarta Pusat. Pusat laundry di Cempaka Putih, laundry Jakarta Pusat, laundry profesional";
  };

  public query ({ caller }) func getInStoreSubcategoriesCount() : async (Nat, Nat) {
    let servicesArray = inStoreSubcategoryServices.values().toArray();

    let selfServiceCount = servicesArray.filter(
      func(s) { s.subcategory == #selfService }
    ).size();

    let operatorServiceCount = servicesArray.filter(
      func(s) { s.subcategory == #operatorService }
    ).size();

    (selfServiceCount, operatorServiceCount);
  };

  /// PUBLIC API FOR CUSTOMER PHOTOS (Shared with #anon)
  public shared ({ caller }) func uploadCustomerPhoto(photo : Storage.ExternalBlob) : async Nat {
    let currentId = nextCustomerPhotoId;
    customerPhotos.add(currentId, photo);
    nextCustomerPhotoId += 1;
    currentId;
  };

  /// Admin-only access to view customer photos for privacy protection
  public query ({ caller }) func getCustomerPhoto(id : Nat) : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer photos");
    };
    customerPhotos.get(id);
  };

  /// Admin-only access to list customer photo IDs for privacy protection
  public query ({ caller }) func getAllCustomerPhotoIds() : async [Nat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view customer photo IDs");
    };
    let photoIds = customerPhotos.keys().toArray();
    photoIds;
  };
};
