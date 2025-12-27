import { Request, Response } from "express";
import BannerModel from "../models/banner.model";
import fs from "fs";
import path from "path";

// Helper to handle file deletion
const deletePhysicalFile = (filePath: string | undefined | null): void => {
  if (filePath) {
    const fullPath = path.join(__dirname, "../..", filePath); // Adjust relative path to your uploads folder
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
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
    const { title, description, buttonText, buttonHref, order } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.background || !files?.main) {
      return res
        .status(400)
        .json({ message: "Background and Main images are required" });
    }

    const banner = await BannerModel.create({
      title,
      description,
      buttonText,
      buttonHref,
      order: Number(order) || 0,
      images: {
        background: `/banners/${files.background[0].filename}`,
        main: `/banners/${files.main[0].filename}`,
        cover: files.cover ? `/banners/${files.cover[0].filename}` : undefined,
      },
    });

    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update banner (The Legal Flow Style)
 */
export const updateBanner = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const banner = await BannerModel.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { title, description, buttonText, buttonHref, order } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const updatedImages = { ...banner.images };

    // Replace images if new ones are uploaded
    if (files?.background) {
      deletePhysicalFile(banner.images.background);
      updatedImages.background = `/uploads/banners/${files.background[0].filename}`;
    }
    if (files?.main) {
      deletePhysicalFile(banner.images.main);
      updatedImages.main = `/uploads/banners/${files.main[0].filename}`;
    }
    if (files?.cover) {
      deletePhysicalFile(banner.images.cover);
      updatedImages.cover = `/uploads/banners/${files.cover[0].filename}`;
    }

    const updatedBanner = await BannerModel.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        buttonText,
        buttonHref,
        order,
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

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Clean up physical files
    const imagePaths = [
      banner.images.background,
      banner.images.main,
      banner.images.cover,
    ];

    imagePaths.forEach((filePath: string | undefined) => {
      deletePhysicalFile(filePath);
    });

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Banner and associated files deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error during deletion",
      error: error.message,
    });
  }
};
