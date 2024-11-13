import { useCallback } from "react";
import { type ChangeEvent, useState } from "react";
import { useClipBoardPaste } from "./useClipBoardPaste";
import { resolve } from "path";

const parseSvgFile = (content: string, fileName: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(content, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    const width = parseInt(svgElement.getAttribute("width") ?? "300");
    const height = parseInt(svgElement.getAttribute("height") ?? "150");

    const svgBlob = new Blob([content], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    return {
        content: svgUrl,
        metadata: {
            width,
            height,
            name: fileName
        },
    };
};

const parseImageFile = (content: string, fileName: string,): Promise<{ content: string; metadata: { width: number; height: number; name: string }; }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                content,
                metadata: {
                    width: img.width,
                    height: img.height,
                    name: fileName,
                },
            });
        };
        img.src = content;
    });
};


export type FileUploadResult = {
    imageContent: string;
    rawContent: string;
    imageMetadata: {
        width: number;
        height: number;
        name: string;
    } | null;
    handleFileUpload: (file: File) => void;
    handleFileUploadEvent: (event: ChangeEvent<HTMLInputElement>) => void;
    cancel: () => void;
};


export const useFileUploader = (): FileUploadResult => {
    const [imageContent, setImageContent] = useState<string>("");
    const [rawContent, setRawContent] = useState<string>("");
    const [imageMetadata, setImageMetadata] = useState<{
        width: number;
        height: number;
        name: string;
    } | null>(null);

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            setRawContent(content);

            if (file.type.startsWith("image/svg+xml")) {
                const { content: svgContent, metadata } = parseSvgFile(content, file.name);
                setImageContent(svgContent);
                setImageMetadata(metadata);
            } else {
                const { content: imageContent, metadata } = await parseImageFile(content, file.name);
                setImageContent(imageContent);
                setImageMetadata(metadata);
            }
        };

        if (file.type === "image/svg+xml") {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }
    };

    const handleFileUploadEvent = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleFilePaste = useCallback((file: File) => {
        processFile(file);
    }, []);

    useClipBoardPaste({
        onPaste: handleFilePaste,
        acceptedFileTypes: ["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"],
    });

    const cancle = () => {
        setImageContent("");
        setImageMetadata(null);
    }

    return {
        imageContent,
        rawContent,
        imageMetadata,
        handleFileUpload: processFile,
        handleFileUploadEvent,
        cancel: cancle,
    };
};
