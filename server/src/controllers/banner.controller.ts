import { Request, Response } from "express";
import BannerModel from "../models/banner.model";
import fs from "fs/promises";
import path from "path";

/**
 * Professional Helper to handle file deletion asynchronously
 */
const deletePhysicalFile = async (
  filePath: string | undefined | null
): Promise<void> => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath);
    try {
      await fs.access(fullPath); // Check if file exists
      await fs.unlink(fullPath);
    } catch (error) {
      console.error(`File deletion failed or file not found: ${fullPath}`);
    }
  }
};

/**
 * @desc    Get all banners
 */
export const getBanners = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const banners = await BannerModel.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create banner
 */
export const createBanner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { uid, title, description, buttonText, buttonHref, order } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.background || !files?.main) {
      return res
        .status(400)
        .json({ message: "Background and Main images are required" });
    }

    // FIX: Map flat body strings into the nested 'button' object required by the Frontend
    const banner = await BannerModel.create({
      uid,
      title,
      description,
      button: {
        text: buttonText || "Play Now",
        href: buttonHref || "/",
      },
      order: Number(order) || 0,
      images: {
        background: `/uploads/banners/${files.background[0].filename}`,
        main: `/uploads/banners/${files.main[0].filename}`,
        cover: files.cover
          ? `/uploads/banners/${files.cover[0].filename}`
          : undefined,
      },
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update banner
 */
export const updateBanner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const banner = await BannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { uid, title, description, buttonText, buttonHref, order } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const updatedImages = { ...banner.images };

    // Async Image Replacements
    if (files?.background) {
      await deletePhysicalFile(banner.images.background);
      updatedImages.background = `/uploads/banners/${files.background[0].filename}`;
    }
    if (files?.main) {
      await deletePhysicalFile(banner.images.main);
      updatedImages.main = `/uploads/banners/${files.main[0].filename}`;
    }
    if (files?.cover) {
      await deletePhysicalFile(banner.images.cover);
      updatedImages.cover = `/uploads/banners/${files.cover[0].filename}`;
    }

    const updatedBanner = await BannerModel.findByIdAndUpdate(
      req.params.id,
      {
        uid,
        title,
        description,

        button: {
          text: buttonText || banner.button?.text,
          href: buttonHref || banner.button?.href,
        },
        order: Number(order) || 0,
        images: updatedImages,
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedBanner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete banner
 */
export const deleteBanner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const banner = await BannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Concurrent File Deletion
    await Promise.all([
      deletePhysicalFile(banner.images.background),
      deletePhysicalFile(banner.images.main),
      deletePhysicalFile(banner.images.cover),
    ]);

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Banner and files deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
