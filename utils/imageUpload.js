const cloudinary = require("./cloudinary");


const imageUpload = async function (filepath) {
    try {
        cloudinary.uploader.upload(filepath, function (err, result) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error"
                })
            }

            result.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                data: result
            })
        })
    } catch (err) {
        throw new Error('Image upload failed. Please try again.');
    }
}

module.exports = imageUpload;
