package upload

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

// Init sets up the Cloudinary client. Call once at startup (e.g. in main.go),
// reading CLOUDINARY_URL from env — format: cloudinary://<key>:<secret>@<cloud_name>
func Init() error {
	c, err := cloudinary.NewFromURL(os.Getenv("CLOUDINARY_URL"))
	if err != nil {
		return fmt.Errorf("initializing cloudinary: %w", err)
	}
	cld = c
	return nil
}

// UploadImage uploads a multipart file to Cloudinary under the given folder
// and returns the secure URL.
func UploadImage(ctx context.Context, file multipart.File, folder string) (string, error) {
	result, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: folder,
	})
	if err != nil {
		return "", fmt.Errorf("uploading image: %w", err)
	}
	return result.SecureURL, nil
}