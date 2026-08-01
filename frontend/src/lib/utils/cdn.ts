export function getCdnUrl(objectName: string): string {
    const baseUrl = import.meta.env.VITE_CDN_URL;
    if (!baseUrl) {
        throw new Error("CDN_URL is not defined in the environment variables.");
    }

    return `${baseUrl}/${objectName}`;
}