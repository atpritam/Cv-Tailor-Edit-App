"use client";

import { useState } from "react";

export function useProfilePhoto() {
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState<string | null>(
    null,
  );

  const handleProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    setProfilePhotoFile(file);
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(String(reader.result || ""));
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    setProfilePhotoDataUrl(dataUrl);
  };

  const resetProfilePhoto = () => {
    setProfilePhotoFile(null);
    setProfilePhotoDataUrl(null);
  };

  return {
    profilePhotoFile,
    profilePhotoDataUrl,
    handleProfilePhotoUpload,
    resetProfilePhoto,
  };
}
