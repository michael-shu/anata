// app/page.tsx
"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setMessage("");
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleSend = async () => {
    if (!file) return;
    try {
      setStatus("pending");
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/ssh", {
        method: "POST",
        body: form,
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Upload failed");

      setStatus("done");
      setMessage("Upload successful!");
    } catch {
      setStatus("error");
      setMessage("Upload failed.");
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-600">
      <div className="w-full max-w-md p-6 space-y-6 bg-gray-800 rounded-4xl">
        <h1 className="text-center text-white font-bold text-5xl">Image Uploader</h1>

        <div onClick={() => inputRef.current?.click()} className="p-8 text-center cursor-pointer">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 object-contain" />
          ) : (
            <p className="text-white text-2xl border-2 border-dashed border-gray-500 p-20 rounded-4xl hover:bg-gray-900">Click to upload an image</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {file && (
          <p className="text-center truncate text-white text-2xl">
            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        <div className="flex justify-between gap-3">
          <button onClick={() => inputRef.current?.click()} className="flex-1 py-2 bg-blue-600 text-white rounded-4xl">
            Upload
          </button>

          <button onClick={handleSend} 
          disabled={!file || status === "pending"} 
          className={"flex-1 py-2 text-white rounded-4xl " + (!file ? "bg-gray-700" : "bg-green-600")}>
            {status === "pending" ? "Sending..." : "Send"}
          </button>

          <button onClick={handleClear} disabled={!file}
          className={"flex-1 py-2 text-white rounded-4xl " + (!file ? "bg-gray-700" : "bg-red-600")}>
            Clear
          </button>
        </div>

        {message && (
          <p className={"text-center " + (status === "error" ? "text-red-500" : "text-green-500")}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
