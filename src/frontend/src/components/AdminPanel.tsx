import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { PatternType, ServiceCategory, StoreServiceCategory } from "../backend";
import {
  useCreateService,
  useCreateStoreSubcategoryService,
  useDeleteService,
  useDeleteStoreSubcategoryService,
  useGetAllServices,
  useGetAllStoreSubcategoryServices,
  useGetBackgroundTheme,
  useGetContactInfo,
  useSetBackgroundTheme,
  useUpdateContactInfo,
  useUpdateService,
  useUpdateStoreSubcategoryService,
} from "../hooks/useQueries";
import { SharePhotoBackgroundManager } from "./SharePhotoBackgroundManager";

export function AdminPanel() {
  const { data: contactInfo, isLoading: contactLoading } = useGetContactInfo();
  const updateContactMutation = useUpdateContactInfo();
  const { data: services, isLoading: servicesLoading } = useGetAllServices();
  const { data: storeServices, isLoading: storeServicesLoading } =
    useGetAllStoreSubcategoryServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const createStoreServiceMutation = useCreateStoreSubcategoryService();
  const updateStoreServiceMutation = useUpdateStoreSubcategoryService();
  const deleteStoreServiceMutation = useDeleteStoreSubcategoryService();
  const { data: backgroundTheme, isLoading: themeLoading } =
    useGetBackgroundTheme();
  const setBackgroundThemeMutation = useSetBackgroundTheme();

  const [contactForm, setContactForm] = useState({
    phone: contactInfo?.phone || "",
    whatsapp: contactInfo?.whatsapp || "",
    address: contactInfo?.address || "",
    hours: contactInfo?.hours || "",
  });

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
    category: ServiceCategory.online,
  });

  const [newStoreService, setNewStoreService] = useState({
    name: "",
    description: "",
    price: "",
    subcategory: StoreServiceCategory.selfService,
  });

  const [_editingService, setEditingService] = useState<bigint | null>(null);
  const [_editingStoreService, setEditingStoreService] = useState<
    bigint | null
  >(null);

  const [themeForm, setThemeForm] = useState({
    pattern: backgroundTheme?.pattern || PatternType.bubbles,
    baseColor: backgroundTheme?.baseColor || "#D6F6FF",
    transparencyLevel: backgroundTheme?.transparencyLevel || BigInt(60),
    patternIntensity: backgroundTheme?.patternIntensity || BigInt(20),
  });

  const handleContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateContactMutation.mutateAsync(contactForm);
      toast.success("Contact information updated successfully");
    } catch (_error) {
      toast.error("Failed to update contact information");
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createServiceMutation.mutateAsync({
        name: newService.name,
        description: newService.description,
        price: BigInt(newService.price),
        category: newService.category,
      });
      toast.success("Service created successfully");
      setNewService({
        name: "",
        description: "",
        price: "",
        category: ServiceCategory.online,
      });
    } catch (_error) {
      toast.error("Failed to create service");
    }
  };

  const handleCreateStoreService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStoreServiceMutation.mutateAsync({
        name: newStoreService.name,
        description: newStoreService.description,
        price: BigInt(newStoreService.price),
        subcategory: newStoreService.subcategory,
      });
      toast.success("Store service created successfully");
      setNewStoreService({
        name: "",
        description: "",
        price: "",
        subcategory: StoreServiceCategory.selfService,
      });
    } catch (_error) {
      toast.error("Failed to create store service");
    }
  };

  const _handleUpdateService = async (
    id: bigint,
    name: string,
    description: string,
    price: string,
  ) => {
    try {
      await updateServiceMutation.mutateAsync({
        id,
        name,
        description,
        price: BigInt(price),
      });
      toast.success("Service updated successfully");
      setEditingService(null);
    } catch (_error) {
      toast.error("Failed to update service");
    }
  };

  const _handleUpdateStoreService = async (
    id: bigint,
    name: string,
    description: string,
    price: string,
  ) => {
    try {
      await updateStoreServiceMutation.mutateAsync({
        id,
        name,
        description,
        price: BigInt(price),
      });
      toast.success("Store service updated successfully");
      setEditingStoreService(null);
    } catch (_error) {
      toast.error("Failed to update store service");
    }
  };

  const handleDeleteService = async (id: bigint) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteServiceMutation.mutateAsync(id);
      toast.success("Service deleted successfully");
    } catch (_error) {
      toast.error("Failed to delete service");
    }
  };

  const handleDeleteStoreService = async (id: bigint) => {
    if (!confirm("Are you sure you want to delete this store service?")) return;
    try {
      await deleteStoreServiceMutation.mutateAsync(id);
      toast.success("Store service deleted successfully");
    } catch (_error) {
      toast.error("Failed to delete store service");
    }
  };

  const handleThemeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setBackgroundThemeMutation.mutateAsync(themeForm);
      toast.success("Background theme updated successfully");
    } catch (_error) {
      toast.error("Failed to update background theme");
    }
  };

  if (
    contactLoading ||
    servicesLoading ||
    storeServicesLoading ||
    themeLoading
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-600">Loading admin panel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="luxury-card">
        <CardHeader>
          <CardTitle className="text-2xl text-sky-900">Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="store-services">Store Services</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="photo-bg">Photo Background</TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="space-y-4">
              <form onSubmit={handleContactUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={contactForm.whatsapp}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        whatsapp: e.target.value,
                      })
                    }
                    placeholder="WhatsApp link"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={contactForm.address}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Business address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    value={contactForm.hours}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, hours: e.target.value })
                    }
                    placeholder="Business hours"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateContactMutation.isPending}
                >
                  {updateContactMutation.isPending
                    ? "Updating..."
                    : "Update Contact Info"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-sky-900">
                  Create New Service
                </h3>
                <form onSubmit={handleCreateService} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Service Name</Label>
                    <Input
                      id="service-name"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      placeholder="Service name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-description">Description</Label>
                    <Textarea
                      id="service-description"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
                      placeholder="Service description"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-price">Price (IDR)</Label>
                    <Input
                      id="service-price"
                      type="number"
                      value={newService.price}
                      onChange={(e) =>
                        setNewService({ ...newService, price: e.target.value })
                      }
                      placeholder="Price"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-category">Category</Label>
                    <Select
                      value={newService.category}
                      onValueChange={(value) =>
                        setNewService({
                          ...newService,
                          category: value as ServiceCategory,
                        })
                      }
                    >
                      <SelectTrigger id="service-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ServiceCategory.online}>
                          Online
                        </SelectItem>
                        <SelectItem value={ServiceCategory.inStore}>
                          In Store
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={createServiceMutation.isPending}
                  >
                    {createServiceMutation.isPending
                      ? "Creating..."
                      : "Create Service"}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-sky-900">
                  Existing Services
                </h3>
                <div className="space-y-2">
                  {services?.map((service) => (
                    <Card key={service.id.toString()} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-gray-600">
                              {service.description}
                            </p>
                            <p className="text-sm font-medium text-sky-700">
                              Rp {service.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingService(service.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteService(service.id)}
                              disabled={deleteServiceMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="store-services" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-sky-900">
                  Create New Store Service
                </h3>
                <form onSubmit={handleCreateStoreService} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-service-name">Service Name</Label>
                    <Input
                      id="store-service-name"
                      value={newStoreService.name}
                      onChange={(e) =>
                        setNewStoreService({
                          ...newStoreService,
                          name: e.target.value,
                        })
                      }
                      placeholder="Service name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-service-description">
                      Description
                    </Label>
                    <Textarea
                      id="store-service-description"
                      value={newStoreService.description}
                      onChange={(e) =>
                        setNewStoreService({
                          ...newStoreService,
                          description: e.target.value,
                        })
                      }
                      placeholder="Service description"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-service-price">Price (IDR)</Label>
                    <Input
                      id="store-service-price"
                      type="number"
                      value={newStoreService.price}
                      onChange={(e) =>
                        setNewStoreService({
                          ...newStoreService,
                          price: e.target.value,
                        })
                      }
                      placeholder="Price"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-service-subcategory">
                      Subcategory
                    </Label>
                    <Select
                      value={newStoreService.subcategory}
                      onValueChange={(value) =>
                        setNewStoreService({
                          ...newStoreService,
                          subcategory: value as StoreServiceCategory,
                        })
                      }
                    >
                      <SelectTrigger id="store-service-subcategory">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={StoreServiceCategory.selfService}>
                          Self Service
                        </SelectItem>
                        <SelectItem
                          value={StoreServiceCategory.operatorService}
                        >
                          Operator Service
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={createStoreServiceMutation.isPending}
                  >
                    {createStoreServiceMutation.isPending
                      ? "Creating..."
                      : "Create Store Service"}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-sky-900">
                  Existing Store Services
                </h3>
                <div className="space-y-2">
                  {storeServices?.map((service) => (
                    <Card key={service.id.toString()} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-gray-600">
                              {service.description}
                            </p>
                            <p className="text-sm font-medium text-sky-700">
                              Rp {service.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingStoreService(service.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteStoreService(service.id)
                              }
                              disabled={deleteStoreServiceMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="theme" className="space-y-4">
              <form onSubmit={handleThemeUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern Type</Label>
                  <Select
                    value={themeForm.pattern}
                    onValueChange={(value) =>
                      setThemeForm({
                        ...themeForm,
                        pattern: value as PatternType,
                      })
                    }
                  >
                    <SelectTrigger id="pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PatternType.bubbles}>
                        Bubbles
                      </SelectItem>
                      <SelectItem value={PatternType.fabricTexture}>
                        Fabric Texture
                      </SelectItem>
                      <SelectItem value={PatternType.waterRipples}>
                        Water Ripples
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseColor">Base Color</Label>
                  <Input
                    id="baseColor"
                    type="color"
                    value={themeForm.baseColor}
                    onChange={(e) =>
                      setThemeForm({ ...themeForm, baseColor: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transparency">
                    Transparency Level: {themeForm.transparencyLevel.toString()}
                    %
                  </Label>
                  <Slider
                    id="transparency"
                    min={0}
                    max={100}
                    step={5}
                    value={[Number(themeForm.transparencyLevel)]}
                    onValueChange={(value) =>
                      setThemeForm({
                        ...themeForm,
                        transparencyLevel: BigInt(value[0]),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">
                    Pattern Intensity: {themeForm.patternIntensity.toString()}%
                  </Label>
                  <Slider
                    id="intensity"
                    min={0}
                    max={100}
                    step={5}
                    value={[Number(themeForm.patternIntensity)]}
                    onValueChange={(value) =>
                      setThemeForm({
                        ...themeForm,
                        patternIntensity: BigInt(value[0]),
                      })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  disabled={setBackgroundThemeMutation.isPending}
                >
                  {setBackgroundThemeMutation.isPending
                    ? "Updating..."
                    : "Update Theme"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="photo-bg" className="space-y-4">
              <SharePhotoBackgroundManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
