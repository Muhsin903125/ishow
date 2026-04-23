const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function buildCloudinaryUrl(
  resourceType: "image" | "video",
  publicId: string,
  transformations: string
) {
  if (!CLOUDINARY_CLOUD_NAME) {
    return publicId;
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${transformations}/${publicId}`;
}

export function resolveCloudinaryImageUrl(
  source?: string,
  transformations = "f_auto,q_auto,c_fill,g_auto,w_1400"
) {
  if (!source) return "";
  if (source.startsWith("cloudinary://")) {
    return buildCloudinaryUrl("image", source.replace("cloudinary://", ""), transformations);
  }
  return source;
}

export function resolveCloudinaryVideoUrl(
  source?: string,
  transformations = "f_auto,q_auto"
) {
  if (!source) return "";
  if (source.startsWith("cloudinary-video://")) {
    return buildCloudinaryUrl("video", source.replace("cloudinary-video://", ""), transformations);
  }
  return source;
}
