"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
} from "lucide-react";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
  Banner,
} from "../services/api/bannerApi";
import { useToast } from "../context/ToastContext";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";

interface ImageFiles {
  background: File | null;
  main: File | null;
  cover: File | null;
}

const AdminBannerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Updated State with UID and flat fields for the form
  const [formData, setFormData] = useState({
    uid: "",
    title: "",
    description: "",
    buttonText: "Play Now",
    buttonHref: "/",
    order: "0",
  });

  const [imageFiles, setImageFiles] = useState<ImageFiles>({
    background: null,
    main: null,
    cover: null,
  });

  const { data: banners = [], isLoading } = useGetBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  // 2. Helper to handle our custom port 3000 and /uploads path
  const getImageUrl = (path: string) => {
    if (!path) return "";
    const baseUrl = import.meta.env.VITE_APP_API_URL?.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner._id);
    setFormData({
      uid: banner.uid,
      title: banner.title,
      description: banner.description,
      buttonText: banner.button.text, // Access from nested object
      buttonHref: banner.button.href, // Access from nested object
      order: banner.order.toString(),
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    key: keyof ImageFiles
  ) => {
    const file = e.target.files?.[0] || null;
    setImageFiles((prev) => ({ ...prev, [key]: file }));
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      uid: "",
      title: "",
      description: "",
      buttonText: "Play Now",
      buttonHref: "/",
      order: "0",
    });
    setImageFiles({ background: null, main: null, cover: null });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("uid", formData.uid);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("buttonText", formData.buttonText);
    data.append("buttonHref", formData.buttonHref);
    data.append("order", formData.order);

    if (imageFiles.background) data.append("background", imageFiles.background);
    if (imageFiles.main) data.append("main", imageFiles.main);
    if (imageFiles.cover) data.append("cover", imageFiles.cover);

    try {
      if (editingId) {
        await updateBanner({ id: editingId, formData: data }).unwrap();
        showToast("Banner Updated!", "success");
      } else {
        if (!imageFiles.background || !imageFiles.main) {
          showToast("Images are required for new banners!", "error");
          return;
        }
        await createBanner(data).unwrap();
        showToast("Banner Published!", "success");
      }
      resetForm();
    } catch (err: any) {
      showToast(err?.data?.message || "Operation failed", "error");
    }
  };

  if (isLoading)
    return (
      <div className="p-20 flex justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase">
            <ImageIcon className="text-purple-600" /> Banner CMS
          </h1>
        </div>
        <button
          onClick={() => (isFormOpen ? resetForm() : setIsFormOpen(true))}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            isFormOpen
              ? "bg-gray-100 text-gray-600"
              : "bg-purple-600 text-white shadow-lg"
          }`}
        >
          {isFormOpen ? <X size={20} /> : <Plus size={20} />}
          {isFormOpen ? "Cancel" : "Create Banner"}
        </button>
      </header>

      {/* Create/Edit Form */}
      {isFormOpen && (
        <Card className="border-2 border-purple-100 shadow-xl overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-purple-600 uppercase">
                General Info
              </h3>

              {/* UID INPUT */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1">
                  UID (e.g. rewards-unlock)
                </label>
                <input
                  className="w-full p-3 border-2 border-gray-100 rounded-xl font-mono text-sm"
                  value={formData.uid}
                  onChange={(e) =>
                    setFormData({ ...formData, uid: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1">
                  Title
                </label>
                <input
                  className="w-full p-3 border-2 border-gray-100 rounded-xl"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border-2 border-gray-100 rounded-xl h-20"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  className="p-3 border-2 border-gray-100 rounded-xl"
                  placeholder="Button Text"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonText: e.target.value })
                  }
                />
                <input
                  className="p-3 border-2 border-gray-100 rounded-xl"
                  placeholder="Button Link"
                  value={formData.buttonHref}
                  onChange={(e) =>
                    setFormData({ ...formData, buttonHref: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-purple-600 uppercase">
                Media Layers
              </h3>
              <FileUploadField
                label="Background"
                onChange={(e) => handleFileChange(e, "background")}
                isSelected={!!imageFiles.background}
              />
              <FileUploadField
                label="Main Layer"
                onChange={(e) => handleFileChange(e, "main")}
                isSelected={!!imageFiles.main}
              />
              <FileUploadField
                label="Overlay (Optional)"
                onChange={(e) => handleFileChange(e, "cover")}
                isSelected={!!imageFiles.cover}
              />

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 ml-1">
                  Display Order
                </label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-100 rounded-xl"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-black shadow-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isCreating || isUpdating
                  ? "SAVING..."
                  : editingId
                  ? "UPDATE BANNER"
                  : "PUBLISH BANNER"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Banner List */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
          Published Banners ({banners.length})
        </h2>
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-6 group hover:border-purple-200 shadow-sm transition-all"
          >
            <div className="w-20 h-20 bg-gray-900 rounded-xl relative overflow-hidden shrink-0 shadow-inner">
              <img
                src={getImageUrl(banner.images.background)}
                className="absolute inset-0 object-cover w-full h-full opacity-40"
                alt="bg"
              />
              <img
                src={getImageUrl(banner.images.main)}
                className="absolute inset-0 object-contain w-full h-full z-10 p-1"
                alt="main"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 truncate uppercase">
                  {banner.title}
                </h4>
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                  #{banner.uid}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {banner.description}
              </p>

              <div className="flex gap-3 mt-2">
                <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded uppercase">
                  {banner.button.text}
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase">
                  ORDER: {banner.order}
                </span>
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
              <button
                onClick={() => handleEdit(banner)}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={() =>
                  confirm("Delete banner?") && deleteBanner(banner._id)
                }
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FileUploadField = ({
  label,
  onChange,
  isSelected,
}: {
  label: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSelected: boolean;
}) => (
  <div
    className={`p-3 border-2 border-dashed rounded-xl flex items-center justify-between transition-all ${
      isSelected ? "border-green-500 bg-green-50" : "border-gray-100 bg-white"
    }`}
  >
    <p className="text-[10px] font-black text-gray-700 uppercase">{label}</p>
    <div className="flex items-center gap-2">
      {isSelected && <CheckCircle2 className="text-green-500" size={16} />}
      <input
        type="file"
        onChange={onChange}
        className="text-[10px] w-32 cursor-pointer"
      />
    </div>
  </div>
);

export default AdminBannerManagement;
