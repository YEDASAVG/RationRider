import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";  // Add .js extension and use correct casing

//add product: /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path);
        return result.secure_url;
      })
    );

    await Product.create({ ...productData, image: imagesUrl });

    res.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get product: /api/product/list
export const productList = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({
            success: true,
            products,
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

//Get single product: /api/product/id
export const productById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json({
            success: true,
            product,
        });
    
    } catch (error) {
        console.error("Error fetching product :", error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

//Change product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try {
        const { id, inStock } = req.body;

        await Product.findByIdAndUpdate(id, { inStock });

        res.json({
            success: true,
            message: "Product stock updated successfully",
        });
    } catch (error) {
        console.error("Error updating product stock:", error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};
