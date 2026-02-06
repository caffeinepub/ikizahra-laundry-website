import { useState, useEffect } from 'react';
import { useGetContactInfo, useIsCallerAdmin, useGetBackgroundTheme, useUpdateBackgroundTheme } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Settings, Phone, MapPin, Clock, Save, Edit2, Palette, Droplets, Waves, Shirt } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'sonner';
import { PatternType } from '../backend';
import type { BackgroundTheme } from '../backend';

const PRESET_COLORS = [
  { name: 'Biru Muda', hue: 200, label: 'Biru Muda (Default)' },
  { name: 'Biru', hue: 240, label: 'Biru' },
  { name: 'Hijau', hue: 150, label: 'Hijau' },
  { name: 'Ungu', hue: 280, label: 'Ungu' },
  { name: 'Merah Muda', hue: 330, label: 'Merah Muda' },
  { name: 'Oranye', hue: 30, label: 'Oranye' },
];

export function AdminPanel() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: contactInfo, isLoading: contactLoading } = useGetContactInfo();
  const { data: backgroundTheme, isLoading: bgThemeLoading } = useGetBackgroundTheme();
  const updateBackgroundTheme = useUpdateBackgroundTheme();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    whatsapp: '',
    address: '',
    hours: '',
  });

  const [selectedHue, setSelectedHue] = useState(200);
  const [selectedPattern, setSelectedPattern] = useState<PatternType>(PatternType.bubbles);
  const [bgColor, setBgColor] = useState('#D6F6FF');
  const [transparency, setTransparency] = useState(60);
  const [patternIntensity, setPatternIntensity] = useState(20);

  useEffect(() => {
    const savedHue = localStorage.getItem('themeHue');
    if (savedHue) {
      const hue = parseInt(savedHue);
      setSelectedHue(hue);
      applyThemeColor(hue);
    } else {
      applyThemeColor(200);
    }
  }, []);

  useEffect(() => {
    if (backgroundTheme) {
      setSelectedPattern(backgroundTheme.pattern);
      setBgColor(backgroundTheme.baseColor);
      setTransparency(Number(backgroundTheme.transparencyLevel));
      setPatternIntensity(Number(backgroundTheme.patternIntensity));
    }
  }, [backgroundTheme]);

  const applyThemeColor = (hue: number) => {
    const root = document.documentElement;
    
    root.style.setProperty('--primary', `0.55 0.18 ${hue}`);
    root.style.setProperty('--secondary', `0.92 0.08 ${hue - 20}`);
    root.style.setProperty('--muted', `0.96 0.01 ${hue}`);
    root.style.setProperty('--muted-foreground', `0.5 0.02 ${hue}`);
    root.style.setProperty('--accent', `0.88 0.12 ${hue - 40}`);
    root.style.setProperty('--border', `0.9 0.02 ${hue}`);
    root.style.setProperty('--input', `0.9 0.02 ${hue}`);
    root.style.setProperty('--ring', `0.55 0.18 ${hue}`);
    root.style.setProperty('--chart-1', `0.55 0.18 ${hue}`);
    root.style.setProperty('--chart-2', `0.65 0.15 ${hue - 40}`);
    root.style.setProperty('--chart-3', `0.7 0.12 ${hue - 60}`);
    root.style.setProperty('--chart-4', `0.6 0.16 ${hue + 20}`);
    root.style.setProperty('--chart-5', `0.5 0.2 ${hue - 20}`);
    root.style.setProperty('--sidebar-primary', `0.55 0.18 ${hue}`);
    root.style.setProperty('--sidebar-accent', `0.96 0.01 ${hue}`);
    root.style.setProperty('--sidebar-border', `0.9 0.02 ${hue}`);
    root.style.setProperty('--sidebar-ring', `0.55 0.18 ${hue}`);
  };

  const handleThemeChange = (hue: number) => {
    setSelectedHue(hue);
    applyThemeColor(hue);
    localStorage.setItem('themeHue', hue.toString());
    toast.success('Warna tema berhasil diubah');
  };

  const handleSaveBackgroundTheme = async () => {
    try {
      const theme: BackgroundTheme = {
        pattern: selectedPattern,
        baseColor: bgColor,
        transparencyLevel: BigInt(transparency),
        patternIntensity: BigInt(patternIntensity),
      };
      
      await updateBackgroundTheme.mutateAsync(theme);
      toast.success('Tema latar belakang berhasil disimpan');
    } catch (error: any) {
      toast.error(error.message || 'Gagal menyimpan tema latar belakang');
    }
  };

  const updateContactMutation = useMutation({
    mutationFn: async (data: { phone: string; whatsapp: string; address: string; hours: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateContactInfo(data.phone, data.whatsapp, data.address, data.hours);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactInfo'] });
      toast.success('Informasi kontak berhasil diperbarui');
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui informasi kontak');
    },
  });

  const openEditDialog = () => {
    if (contactInfo) {
      setFormData({
        phone: contactInfo.phone,
        whatsapp: contactInfo.whatsapp,
        address: contactInfo.address,
        hours: contactInfo.hours,
      });
    }
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.phone || !formData.whatsapp || !formData.address || !formData.hours) {
      toast.error('Semua bidang harus diisi');
      return;
    }

    await updateContactMutation.mutateAsync(formData);
  };

  const getPatternIcon = (pattern: PatternType) => {
    switch (pattern) {
      case PatternType.bubbles:
        return <Droplets className="h-5 w-5" />;
      case PatternType.fabricTexture:
        return <Shirt className="h-5 w-5" />;
      case PatternType.waterRipples:
        return <Waves className="h-5 w-5" />;
      default:
        return <Droplets className="h-5 w-5" />;
    }
  };

  const getPatternLabel = (pattern: PatternType) => {
    switch (pattern) {
      case PatternType.bubbles:
        return 'Gelembung';
      case PatternType.fabricTexture:
        return 'Tekstur Kain';
      case PatternType.waterRipples:
        return 'Riak Air';
      default:
        return 'Gelembung';
    }
  };

  if (!identity || adminLoading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  if (contactLoading || bgThemeLoading) {
    return (
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-64 max-w-4xl mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Panel Admin</h2>
                <p className="text-sm text-muted-foreground">Kelola informasi kontak, layanan, dan tema situs</p>
              </div>
            </div>

            <Tabs defaultValue="contact" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="contact">Informasi Kontak</TabsTrigger>
                <TabsTrigger value="services">Kelola Layanan</TabsTrigger>
                <TabsTrigger value="theme">Tema Warna</TabsTrigger>
                <TabsTrigger value="background">Latar Belakang</TabsTrigger>
              </TabsList>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Informasi Kontak</CardTitle>
                        <CardDescription>
                          Informasi kontak yang ditampilkan di halaman website
                        </CardDescription>
                      </div>
                      <Button onClick={openEditDialog} size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium mb-1">Nomor Telepon</p>
                          <p className="text-sm text-muted-foreground break-all">{contactInfo?.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <SiWhatsapp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium mb-1">WhatsApp</p>
                          <p className="text-sm text-muted-foreground break-all">{contactInfo?.whatsapp}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium mb-1">Alamat</p>
                          <p className="text-sm text-muted-foreground">{contactInfo?.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                        <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium mb-1">Jam Operasional</p>
                          <p className="text-sm text-muted-foreground">{contactInfo?.hours}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Kelola Layanan</CardTitle>
                    <CardDescription>
                      Tambah, edit, atau hapus layanan laundry. Scroll ke bawah untuk melihat daftar layanan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-6 bg-muted/50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Untuk mengelola layanan, scroll ke bagian "Layanan Kami" di bawah.
                        </p>
                        <Button
                          onClick={() => {
                            const element = document.getElementById('services');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          Lihat Layanan
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Fitur Kelola Layanan:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Tambah layanan baru</li>
                            <li>• Edit nama, deskripsi, dan harga</li>
                            <li>• Upload foto layanan</li>
                            <li>• Hapus layanan</li>
                          </ul>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Tips:</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Gunakan foto berkualitas tinggi</li>
                            <li>• Pilih rasio aspek 9:16 untuk tampilan vertikal</li>
                            <li>• Tulis deskripsi yang jelas dan menarik</li>
                            <li>• Perbarui harga secara berkala</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="theme">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Kustomisasi Warna Tema</CardTitle>
                        <CardDescription>
                          Pilih warna utama untuk tema situs web Anda
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-base font-medium">Pilih Warna Tema</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color.hue}
                            onClick={() => handleThemeChange(color.hue)}
                            className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                              selectedHue === color.hue
                                ? 'border-primary shadow-lg'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div
                                className="w-16 h-16 rounded-full shadow-md"
                                style={{
                                  background: `oklch(0.55 0.18 ${color.hue})`,
                                }}
                              />
                              <div className="text-center">
                                <p className="font-medium text-sm">{color.label}</p>
                                {selectedHue === color.hue && (
                                  <p className="text-xs text-primary mt-1">✓ Aktif</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <Label className="text-base font-medium">Warna Kustom</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label htmlFor="custom-hue" className="text-sm text-muted-foreground mb-2 block">
                            Geser untuk memilih warna (0-360°)
                          </Label>
                          <input
                            id="custom-hue"
                            type="range"
                            min="0"
                            max="360"
                            value={selectedHue}
                            onChange={(e) => handleThemeChange(parseInt(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, 
                                oklch(0.55 0.18 0), 
                                oklch(0.55 0.18 60), 
                                oklch(0.55 0.18 120), 
                                oklch(0.55 0.18 180), 
                                oklch(0.55 0.18 240), 
                                oklch(0.55 0.18 300), 
                                oklch(0.55 0.18 360))`,
                            }}
                          />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-full shadow-md border-2 border-border"
                            style={{
                              background: `oklch(0.55 0.18 ${selectedHue})`,
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{selectedHue}°</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Pratinjau Elemen</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm">Tombol Utama</Button>
                        <Button size="sm" variant="secondary">Tombol Sekunder</Button>
                        <Button size="sm" variant="outline">Tombol Outline</Button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="h-2 flex-1 bg-primary rounded-full" />
                        <div className="h-2 flex-1 bg-secondary rounded-full" />
                        <div className="h-2 flex-1 bg-accent rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="background">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Palette className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle>Kustomisasi Latar Belakang</CardTitle>
                        <CardDescription>
                          Pilih pola, warna, dan transparansi latar belakang
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pattern Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Pilih Pola Latar Belakang</Label>
                      <RadioGroup
                        value={selectedPattern}
                        onValueChange={(value) => setSelectedPattern(value as PatternType)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <div>
                          <RadioGroupItem value={PatternType.bubbles} id="pattern-bubbles" className="peer sr-only" />
                          <Label
                            htmlFor="pattern-bubbles"
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                              <Droplets className="h-8 w-8 text-primary" />
                            </div>
                            <span className="font-medium">Gelembung</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Pola gelembung sabun
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value={PatternType.fabricTexture} id="pattern-fabric" className="peer sr-only" />
                          <Label
                            htmlFor="pattern-fabric"
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                              <Shirt className="h-8 w-8 text-primary" />
                            </div>
                            <span className="font-medium">Tekstur Kain</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Pola tekstur kain lembut
                            </span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value={PatternType.waterRipples} id="pattern-ripples" className="peer sr-only" />
                          <Label
                            htmlFor="pattern-ripples"
                            className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                              <Waves className="h-8 w-8 text-primary" />
                            </div>
                            <span className="font-medium">Riak Air</span>
                            <span className="text-xs text-muted-foreground text-center mt-1">
                              Pola riak air yang tenang
                            </span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-3">
                      <Label htmlFor="bg-color" className="text-base font-medium">Warna Latar Belakang</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="bg-color"
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-20 h-12 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          placeholder="#D6F6FF"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pilih warna dasar untuk latar belakang pola
                      </p>
                    </div>

                    {/* Transparency Level */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Tingkat Transparansi</Label>
                        <span className="text-sm text-muted-foreground">{transparency}%</span>
                      </div>
                      <Slider
                        value={[transparency]}
                        onValueChange={(value) => setTransparency(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Atur transparansi pola (0% = tidak terlihat, 100% = sangat jelas)
                      </p>
                    </div>

                    {/* Pattern Intensity */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Intensitas Pola</Label>
                        <span className="text-sm text-muted-foreground">{patternIntensity}%</span>
                      </div>
                      <Slider
                        value={[patternIntensity]}
                        onValueChange={(value) => setPatternIntensity(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Atur kepadatan dan ukuran pola
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="space-y-3 pt-4 border-t">
                      <Label className="text-base font-medium">Pratinjau</Label>
                      <div 
                        className="relative h-32 rounded-lg border-2 overflow-hidden"
                        style={{
                          backgroundColor: bgColor,
                        }}
                      >
                        <div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: selectedPattern === PatternType.bubbles 
                              ? 'url(/assets/generated/laundry-bubbles-pattern-transparent.dim_400x400.png)'
                              : selectedPattern === PatternType.fabricTexture
                              ? 'url(/assets/generated/fabric-texture-pattern-transparent.dim_400x400.png)'
                              : 'url(/assets/generated/water-ripples-pattern-transparent.dim_400x400.png)',
                            backgroundRepeat: 'repeat',
                            backgroundSize: `${200 * (patternIntensity / 100 + 0.5)}px`,
                            opacity: transparency / 100,
                          }}
                        />
                        <div className="relative z-10 flex items-center justify-center h-full">
                          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg">
                            <p className="text-sm font-medium text-gray-800">Contoh Konten</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        onClick={handleSaveBackgroundTheme}
                        disabled={updateBackgroundTheme.isPending}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updateBackgroundTheme.isPending ? 'Menyimpan...' : 'Simpan Tema Latar Belakang'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Edit Contact Info Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Informasi Kontak</DialogTitle>
            <DialogDescription>
              Perbarui informasi kontak yang ditampilkan di website
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Nomor Telepon</span>
                </div>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 62 857-1673-3929"
              />
              <p className="text-xs text-muted-foreground">
                Format: 62 diikuti nomor telepon
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                <div className="flex items-center gap-2 mb-1">
                  <SiWhatsapp className="h-4 w-4 text-primary" />
                  <span>Link WhatsApp</span>
                </div>
              </Label>
              <Input
                id="whatsapp"
                type="url"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="Contoh: https://wa.me/6285716733929"
              />
              <p className="text-xs text-muted-foreground">
                Format: https://wa.me/[nomor tanpa +]
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Alamat</span>
                </div>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Contoh: Jl. Cempaka Warna No. 26 RT 09 RW 04, Cempaka Putih, Jakarta Pusat"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Jam Operasional</span>
                </div>
              </Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Contoh: Senin - Sabtu: 08.00 - 20.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateContactMutation.isPending}
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateContactMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateContactMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

