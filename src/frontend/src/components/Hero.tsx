import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Pencil, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { ImageType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetImagesByType, useIsCallerAdmin } from "../hooks/useQueries";
import { HeroBannerEditor } from "./HeroBannerEditor";

const QR_DESCRIPTION_KEY = "iki_zahra_qr_description";
const QR_TITLE_KEY = "iki_zahra_qr_title";

const DEFAULT_TITLE = "Scan QR Code";
const DEFAULT_DESCRIPTION = "Scan untuk langsung membuka website kami";

export function Hero() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: heroImages } = useGetImagesByType(ImageType.hero);
  const [showEditor, setShowEditor] = useState(false);
  const [showQrEditor, setShowQrEditor] = useState(false);
  const [qrTitle, setQrTitle] = useState(DEFAULT_TITLE);
  const [qrDescription, setQrDescription] = useState(DEFAULT_DESCRIPTION);
  const [editTitle, setEditTitle] = useState(DEFAULT_TITLE);
  const [editDescription, setEditDescription] = useState(DEFAULT_DESCRIPTION);

  useEffect(() => {
    const savedTitle = localStorage.getItem(QR_TITLE_KEY);
    const savedDesc = localStorage.getItem(QR_DESCRIPTION_KEY);
    if (savedTitle) setQrTitle(savedTitle);
    if (savedDesc) setQrDescription(savedDesc);
  }, []);

  const openQrEditor = () => {
    setEditTitle(qrTitle);
    setEditDescription(qrDescription);
    setShowQrEditor(true);
  };

  const saveQrText = () => {
    setQrTitle(editTitle);
    setQrDescription(editDescription);
    localStorage.setItem(QR_TITLE_KEY, editTitle);
    localStorage.setItem(QR_DESCRIPTION_KEY, editDescription);
    setShowQrEditor(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const heroImage =
    heroImages && heroImages.length > 0
      ? heroImages[heroImages.length - 1]
      : null;

  const websiteUrl = "https://www.ikizahralaundry.co.id";

  return (
    <>
      <section id="home" className="pt-16 md:pt-20 relative overflow-hidden">
        <div className="gradient-luxury-blue-mint relative">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="grid lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto">
              {/* Left Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="space-y-5">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-sky-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent leading-tight">
                    Iki Zahra Laundry
                  </h1>
                  <p className="text-xl md:text-2xl text-sky-800/90 leading-relaxed font-medium">
                    Laundry professional di Jakarta Pusat, Cempaka Putih
                  </p>
                  <p className="text-base md:text-lg text-sky-700/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Layanan laundry berkualitas tinggi dengan hasil terbaik dan
                    harga terjangkau
                  </p>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                  <Button
                    data-ocid="hero.primary_button"
                    size="lg"
                    onClick={() => scrollToSection("services")}
                    className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Pesan Sekarang
                  </Button>
                  <Button
                    data-ocid="hero.secondary_button"
                    size="lg"
                    variant="outline"
                    onClick={() => scrollToSection("contact")}
                    className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 border-2 border-sky-600 text-sky-700 hover:bg-sky-50/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    Hubungi Kami
                  </Button>
                </div>
              </div>

              {/* Right Image */}
              <div className="flex justify-center lg:justify-end relative">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 rounded-3xl blur-2xl" />
                  {heroImage?.image ? (
                    <img
                      src={heroImage.image.getDirectURL()}
                      alt={heroImage.description || "Iki Zahra Laundry"}
                      className="relative w-full h-auto rounded-2xl shadow-2xl ring-4 ring-white/50"
                      loading="eager"
                    />
                  ) : (
                    <img
                      src="/assets/IMG-20260103-WA0001.jpg"
                      alt="Iki Zahra Laundry - Sambut Gembira Bersih Cemerlang"
                      className="relative w-full h-auto rounded-2xl shadow-2xl ring-4 ring-white/50"
                      loading="eager"
                    />
                  )}

                  {isAdmin && identity && (
                    <Button
                      onClick={() => setShowEditor(true)}
                      className="absolute top-4 right-4 gap-2 bg-white/95 hover:bg-white text-sky-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Banner
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center lg:justify-end mt-6">
              <div className="relative flex items-center gap-5 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-lg ring-1 ring-sky-200 max-w-sm">
                <div className="flex-shrink-0 p-2 bg-white rounded-xl shadow-sm ring-1 ring-sky-100">
                  <QRCodeSVG
                    value={websiteUrl}
                    size={100}
                    bgColor="#ffffff"
                    fgColor="#0369a1"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-sky-600" />
                    <p className="text-sm font-bold text-sky-800">{qrTitle}</p>
                  </div>
                  <p className="text-xs text-sky-700 leading-snug whitespace-pre-wrap">
                    {qrDescription}
                  </p>
                  <p className="text-xs font-medium text-sky-600 break-all">
                    {websiteUrl}
                  </p>
                </div>

                {/* Edit button for admin */}
                {isAdmin && identity && (
                  <button
                    type="button"
                    data-ocid="hero.qr_edit_button"
                    onClick={openQrEditor}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
                    title="Edit keterangan QR code"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* Hero Banner Editor Dialog */}
      {showEditor && (
        <HeroBannerEditor
          open={showEditor}
          onClose={() => setShowEditor(false)}
          currentImage={heroImage}
        />
      )}

      {/* QR Code Text Editor Dialog */}
      <Dialog open={showQrEditor} onOpenChange={setShowQrEditor}>
        <DialogContent data-ocid="qr_editor.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Keterangan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Judul</p>
              <input
                id="qr-title-input"
                data-ocid="qr_editor.input"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Judul QR code..."
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">
                Keterangan / Kriteria
              </p>
              <Textarea
                id="qr-desc-textarea"
                data-ocid="qr_editor.textarea"
                className="w-full min-h-[120px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Tulis keterangan atau kriteria QR code di sini... (tidak terbatas)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="qr_editor.cancel_button"
              variant="outline"
              onClick={() => setShowQrEditor(false)}
            >
              Batal
            </Button>
            <Button
              data-ocid="qr_editor.save_button"
              onClick={saveQrText}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
