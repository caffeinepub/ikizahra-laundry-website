import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Service, ServiceCategory, ProcessedImage, ContactInfo, ContactFormEntry, StoreSubcategoryService, StoreServiceCategory, BackgroundTheme } from '../backend';
import { ExternalBlob, AspectRatioOption, ImageType } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOrderedGalleryImages() {
  const { actor, isFetching } = useActor();

  return useQuery<ProcessedImage[]>({
    queryKey: ['orderedGalleryImages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrderedGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetImagesByType(imageType: ImageType) {
  const { actor, isFetching } = useActor();

  return useQuery<ProcessedImage[]>({
    queryKey: ['imagesByType', imageType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getImagesByType(imageType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateImageDescription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; description: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateImageDescription(data.id, data.description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderedGalleryImages'] });
      queryClient.invalidateQueries({ queryKey: ['imagesByType'] });
    },
  });
}

export function useUploadGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      image: ExternalBlob; 
      description: string;
      aspectRatio: AspectRatioOption;
      fileSizeBytes: bigint;
      width: bigint;
      height: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadProcessedGalleryImage(
        data.image, 
        data.description,
        data.aspectRatio,
        data.fileSizeBytes,
        null,
        data.width,
        data.height
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderedGalleryImages'] });
      queryClient.invalidateQueries({ queryKey: ['imagesByType'] });
    },
  });
}

export function useDeleteGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteGalleryImage(imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderedGalleryImages'] });
      queryClient.invalidateQueries({ queryKey: ['imagesByType', ImageType.gallery] });
    },
  });
}

export function useReplaceGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      imageId: bigint;
      newImage: ExternalBlob;
      description?: string;
      aspectRatio: AspectRatioOption;
      fileSizeBytes: bigint;
      width: bigint;
      height: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.replaceGalleryImage(
        data.imageId,
        data.newImage,
        data.description || null,
        data.aspectRatio,
        data.fileSizeBytes,
        null,
        data.width,
        data.height
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderedGalleryImages'] });
      queryClient.invalidateQueries({ queryKey: ['imagesByType', ImageType.gallery] });
    },
  });
}

export function useUploadHeroImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      image: ExternalBlob; 
      description: string;
      aspectRatio: AspectRatioOption;
      fileSizeBytes: bigint;
      width: bigint;
      height: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadHeroImage(
        data.image, 
        data.description,
        data.aspectRatio,
        data.fileSizeBytes,
        null,
        data.width,
        data.height
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderedGalleryImages'] });
      queryClient.invalidateQueries({ queryKey: ['imagesByType'] });
    },
  });
}

export function useGetServicesByCategory(category: ServiceCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<Service[]>({
    queryKey: ['services', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServicesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetServicesByStoreSubcategory(subcategory: StoreServiceCategory) {
  const { actor, isFetching } = useActor();

  return useQuery<StoreSubcategoryService[]>({
    queryKey: ['storeSubcategoryServices', subcategory],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServicesByStoreSubcategory(subcategory);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; price: bigint; category: ServiceCategory }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createService(data.name, data.description, data.price, data.category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useCreateStoreSubcategoryService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; price: bigint; subcategory: StoreServiceCategory }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createStoreSubcategoryService(data.name, data.description, data.price, data.subcategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSubcategoryServices'] });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; description: string; price: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateService(data.id, data.name, data.description, data.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateStoreSubcategoryService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; description: string; price: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateStoreSubcategoryService(data.id, data.name, data.description, data.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSubcategoryServices'] });
    },
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useDeleteStoreSubcategoryService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteStoreSubcategoryService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSubcategoryServices'] });
    },
  });
}

export function useUploadServiceImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      id: bigint; 
      image: ExternalBlob;
      aspectRatio: AspectRatioOption;
      fileSizeBytes: bigint;
      width: bigint;
      height: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadProcessedServiceImage(
        data.id, 
        data.image,
        data.aspectRatio,
        data.fileSizeBytes,
        null,
        data.width,
        data.height
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUploadStoreSubcategoryServiceImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { 
      id: bigint; 
      image: ExternalBlob;
      aspectRatio: AspectRatioOption;
      fileSizeBytes: bigint;
      width: bigint;
      height: bigint;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadProcessedStoreSubcategoryServiceImage(
        data.id, 
        data.image,
        data.aspectRatio,
        data.fileSizeBytes,
        null,
        data.width,
        data.height
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSubcategoryServices'] });
    },
  });
}

export function useGetContactInfo() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactInfo | null>({
    queryKey: ['contactInfo'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getContactInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateContactInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { phone: string; whatsapp: string; address: string; hours: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateContactInfo(data.phone, data.whatsapp, data.address, data.hours);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
    },
  });
}

export function useSubmitContactForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; phone: string; message: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.submitContactForm(data.name, data.phone, data.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactFormSubmissions'] });
    },
  });
}

export function useGetAllContactFormSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<ContactFormEntry[]>({
    queryKey: ['contactFormSubmissions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllContactFormEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBackgroundTheme() {
  const { actor, isFetching } = useActor();

  return useQuery<BackgroundTheme>({
    queryKey: ['backgroundTheme'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBackgroundTheme();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateBackgroundTheme() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: BackgroundTheme) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setBackgroundTheme(theme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backgroundTheme'] });
    },
  });
}

export function useUploadCustomerPhoto() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (photo: ExternalBlob) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadCustomerPhoto(photo);
    },
  });
}
