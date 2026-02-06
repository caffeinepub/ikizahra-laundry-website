import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ShadowConfig {
    blurRadius: bigint;
    color: string;
    offsetX: bigint;
    offsetY: bigint;
}
export interface ProcessedImage {
    id: bigint;
    optimizedUrl?: string;
    originalWidth?: bigint;
    imageType: ImageType;
    originalHeight?: bigint;
    sortOrder: bigint;
    fileSizeBytes: bigint;
    description: string;
    image?: ExternalBlob;
    uploadTime: Time;
    aspectRatio: AspectRatioOption;
}
export type Time = bigint;
export interface TextureConfig {
    patternType: string;
    scale: bigint;
    colorOverlay: string;
    intensity: bigint;
}
export interface ColorHarmony {
    accent: string;
    secondary: string;
    primary: string;
}
export interface HeaderStyleConfig {
    shadow?: ShadowConfig;
    gradient?: GradientConfig;
    layout?: LayoutConfig;
    isResponsive: boolean;
    texture?: TextureConfig;
    responsive?: ResponsiveConfig;
    colorHarmony?: ColorHarmony;
    typography?: TypographyConfig;
}
export interface GradientConfig {
    direction: string;
    endColor: string;
    startColor: string;
    intensity: bigint;
}
export interface TypographyConfig {
    fontFamily: string;
    fontWeight: string;
    fontSize: bigint;
    letterSpacing: bigint;
}
export interface ContactInfo {
    hours: string;
    whatsapp: string;
    address: string;
    phone: string;
}
export interface ContactFormEntry {
    id: bigint;
    name: string;
    message: string;
    timestamp: Time;
    phone: string;
}
export interface BannerInfo {
    name: string;
    message: string;
    image?: ExternalBlob;
}
export interface ResponsiveConfig {
    mobileFontSize: bigint;
    desktopPadding: bigint;
    tabletFontSize: bigint;
    desktopFontSize: bigint;
    mobilePadding: bigint;
    tabletPadding: bigint;
}
export interface Service {
    id: bigint;
    name: string;
    description: string;
    isActive: boolean;
    category: ServiceCategory;
    image?: ProcessedImage;
    price: bigint;
}
export interface ThemeConfig {
    harmonyLevel: bigint;
    luxuryPreset: boolean;
    colorHarmony: ColorHarmony;
    gradients: Array<GradientConfig>;
}
export interface StoreSubcategoryService {
    id: bigint;
    subcategory: StoreServiceCategory;
    name: string;
    description: string;
    isActive: boolean;
    image?: ProcessedImage;
    price: bigint;
}
export interface LayoutConfig {
    borderRadius: bigint;
    margin: bigint;
    padding: bigint;
    alignment: string;
}
export interface ExtendedThemeConfig {
    harmonyLevel: bigint;
    theme?: ThemeConfig;
    gradient?: GradientConfig;
    luxuryPreset: boolean;
    headerStyle?: HeaderStyleConfig;
    colorHarmony?: ColorHarmony;
}
export interface BackgroundTheme {
    pattern: PatternType;
    baseColor: string;
    patternIntensity: bigint;
    transparencyLevel: bigint;
}
export interface UserProfile {
    name: string;
    phoneNumber: string;
}
export enum AspectRatioOption {
    square = "square",
    portrait = "portrait",
    original = "original",
    landscape = "landscape"
}
export enum ImageType {
    service = "service",
    hero = "hero",
    logo = "logo",
    contactBackground = "contactBackground",
    gallery = "gallery"
}
export enum PatternType {
    waterRipples = "waterRipples",
    bubbles = "bubbles",
    fabricTexture = "fabricTexture"
}
export enum ServiceCategory {
    inStore = "inStore",
    online = "online"
}
export enum StoreServiceCategory {
    operatorService = "operatorService",
    selfService = "selfService"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createService(name: string, description: string, price: bigint, category: ServiceCategory): Promise<bigint>;
    createStoreSubcategoryService(name: string, description: string, price: bigint, subcategory: StoreServiceCategory): Promise<bigint>;
    deleteGalleryImage(imageId: bigint): Promise<void>;
    deleteService(id: bigint): Promise<void>;
    deleteStoreSubcategoryService(id: bigint): Promise<void>;
    getAllActiveServicesByCategory(category: ServiceCategory): Promise<Array<Service>>;
    getAllActiveStoreSubcategoryServicesBySubcategory(subcategory: StoreServiceCategory): Promise<Array<StoreSubcategoryService>>;
    getAllContactFormEntries(): Promise<Array<ContactFormEntry>>;
    /**
     * / Admin-only access to list customer photo IDs for privacy protection
     */
    getAllCustomerPhotoIds(): Promise<Array<bigint>>;
    getAllProcessedImages(): Promise<Array<ProcessedImage>>;
    getAllServices(): Promise<Array<Service>>;
    getAllStoreSubcategoryServices(): Promise<Array<StoreSubcategoryService>>;
    getBackgroundTheme(): Promise<BackgroundTheme>;
    getBanner(): Promise<BannerInfo | null>;
    getButtonGradient(): Promise<GradientConfig>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getColorHarmony(): Promise<ColorHarmony | null>;
    getContactFormEntry(id: bigint): Promise<ContactFormEntry | null>;
    getContactInfo(): Promise<ContactInfo>;
    /**
     * / Admin-only access to view customer photos for privacy protection
     */
    getCustomerPhoto(id: bigint): Promise<ExternalBlob | null>;
    getExtendedThemeConfig(): Promise<ExtendedThemeConfig | null>;
    getGradients(): Promise<Array<GradientConfig>>;
    getHeaderStyleConfig(): Promise<HeaderStyleConfig | null>;
    getImagesByType(imageType: ImageType): Promise<Array<ProcessedImage>>;
    getInStoreSubcategoriesCount(): Promise<[bigint, bigint]>;
    getOrderedGalleryImages(): Promise<Array<ProcessedImage>>;
    getService(id: bigint): Promise<Service | null>;
    getServicesByCategory(category: ServiceCategory): Promise<Array<Service>>;
    getServicesByStoreSubcategory(subcategory: StoreServiceCategory): Promise<Array<StoreSubcategoryService>>;
    getStaticDescription(): Promise<string>;
    getStoreSubcategoryService(id: bigint): Promise<StoreSubcategoryService | null>;
    getThemeConfig(): Promise<ThemeConfig | null>;
    getTitleGradient(): Promise<GradientConfig>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isDemoModeActive(): Promise<boolean>;
    isDemoStateSet(): Promise<boolean>;
    replaceGalleryImage(imageId: bigint, newImage: ExternalBlob | null, desc: string | null, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBackgroundTheme(bgTheme: BackgroundTheme): Promise<void>;
    setDemoState(): Promise<void>;
    setExtendedThemeConfig(config: ExtendedThemeConfig): Promise<void>;
    setHeaderStyleConfig(config: HeaderStyleConfig): Promise<void>;
    setThemeConfig(config: ThemeConfig): Promise<void>;
    submitContactForm(name: string, phone: string, message: string): Promise<bigint>;
    updateContactInfo(phone: string, whatsapp: string, address: string, hours: string): Promise<void>;
    updateImageDescription(id: bigint, newDesc: string): Promise<void>;
    updateService(id: bigint, name: string, description: string, price: bigint): Promise<void>;
    updateServiceWithoutImage(id: bigint, name: string, description: string, price: bigint): Promise<void>;
    updateStoreSubcategoryService(id: bigint, name: string, description: string, price: bigint): Promise<void>;
    updateStoreSubcategoryServiceWithoutImage(id: bigint, name: string, description: string, price: bigint): Promise<void>;
    uploadBanner(name: string, message: string, image: ExternalBlob | null): Promise<void>;
    /**
     * / PUBLIC API FOR CUSTOMER PHOTOS (Shared with #anon)
     */
    uploadCustomerPhoto(photo: ExternalBlob): Promise<bigint>;
    uploadHeroImage(image: ExternalBlob | null, desc: string, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<bigint>;
    uploadLogoImage(image: ExternalBlob | null, desc: string, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<bigint>;
    uploadProcessedContactBackgroundImage(image: ExternalBlob | null, desc: string, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<bigint>;
    uploadProcessedGalleryImage(image: ExternalBlob | null, desc: string, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<bigint>;
    uploadProcessedServiceImage(id: bigint, image: ExternalBlob | null, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<void>;
    uploadProcessedStoreSubcategoryServiceImage(id: bigint, image: ExternalBlob | null, aspectRatio: AspectRatioOption, fileSizeBytes: bigint, optimizedUrl: string | null, width: bigint | null, height: bigint | null): Promise<void>;
}
