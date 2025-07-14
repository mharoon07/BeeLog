"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, X, Save, Sun, Moon } from "lucide-react";
import dynamic from "next/dynamic";
import { toast, Toaster } from "react-hot-toast";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });
import { useRouter } from "next/navigation";
export default function CreatePostPage() {
  const [post, setPost] = useState({
    title: "",
    content: "",
    author: "",
    imageUrl: "",
    tags: [],
    category: "Technology",
    file: null,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const editor = useRef(null);
  const router = useRouter();

  const availableTags = [
    "Web Development",
    "React",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "Tailwind CSS",
    "UI/UX Design",
    "Frontend",
    "Backend",
    "Databases",
    "Cloud Computing",
    "AI/ML",
    "DevOps",
    "Mobile Development",
    "Cybersecurity",
    "Data Science",
    "Blockchain",
    "Gaming",
    "Productivity",
    "Career Advice",
    "Lifestyle",
    "Health",
    "Fitness",
    "Food",
    "Travel",
    "Photography",
    "Personal Growth",
    "Finance",
    "Marketing",
    "Startups",
  ];

  const categories = [
    "Technology",
    "Development",
    "Design",
    "Business",
    "Lifestyle",
    "Travel",
    "Food",
    "Tutorial",
    "News",
    "Opinion",
    "Case Study",
  ];

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleImageUpload = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPEG and PNG files are allowed");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      setPost({ ...post, imageUrl, file });
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        toast.success("Image selected successfully!");
      }, 500);
    }, 1000);
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleTagToggle = (tag) => {
    setPost((prevPost) => {
      const currentTags = prevPost.tags;
      if (currentTags.includes(tag)) {
        return {
          ...prevPost,
          tags: currentTags.filter((t) => t !== tag),
        };
      } else {
        return {
          ...prevPost,
          tags: [...currentTags, tag],
        };
      }
    });
  };

  const handleSave = async () => {
    const editorContent = post.content;

    if (
      !post.title.trim() ||
      !editorContent.trim() ||
      !post.author.trim() ||
      !post.category ||
      post.tags.length === 0
    ) {
      toast.error(
        "Please fill in all required fields (Title, Content, Author, Category, and select at least one Tag)"
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("content", editorContent);
    formData.append("author", post.author);
    formData.append("tags", JSON.stringify(post.tags));
    formData.append("category", post.category);

    if (post.file) {
      formData.append("image", post.file);
    } else if (post.imageUrl === "") {
      formData.append("image", "");
    }

    const saveInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(saveInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch("/api/create", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Post saved successfully", { response: data });
      toast.success("Post saved successfully!");
      router.push("/");
      setPost({
        title: "",
        content: "",
        author: "",
        imageUrl: "",
        tags: [],
        category: "Technology",
        file: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";

      clearInterval(saveInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Save failed", error);
      toast.error(`Failed to save post: ${error.message}`);
      clearInterval(saveInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const joditConfig = {
    height: 400,
    toolbarAdaptive: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "fullsize",
      "selectall",
      "source",
    ],
    theme: darkMode ? "dark" : "default",
    placeholder: "Write your post content here... (Markdown supported)",

    style: {
      background: darkMode ? "#1F2937" : "#FFFFFF",
      color: darkMode ? "#F3F4F6" : "#1F2937",
    },
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-950" : "bg-gray-100"
      }`}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <header
        className={`sticky top-0 z-20 transition-colors duration-300 ${
          darkMode
            ? "bg-gray-900/95 border-gray-700"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm border-b`}
      >
        <div className="flex items-center justify-between p-6 max-w-4xl mx-auto">
          <Link
            href="/"
            className={`flex items-center ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } hover:text-teal-600 transition-colors`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Post
                </>
              )}
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h1
          className={`text-4xl font-bold mb-8 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Create New Post
        </h1>
        <div className="space-y-6">
          <div className="space-y-4">
            <label
              className={`block text-lg font-semibold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Hero Image
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                  : `border-gray-300 dark:border-gray-700 hover:border-teal-400 ${
                      darkMode ? "dark:hover:border-teal-600" : ""
                    }`
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {post.imageUrl ? (
                <div className="relative group">
                  <Image
                    src={post.imageUrl}
                    alt="Preview"
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    priority
                  />
                  <button
                    onClick={() => {
                      setPost({ ...post, imageUrl: "", file: null });
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      toast.success("Image removed.");
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100"
                    aria-label="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload
                    className={`w-14 h-14 mx-auto mb-4 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-lg font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Drop your image here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`${
                        darkMode ? "text-teal-400" : "text-teal-600"
                      } hover:text-teal-700 dark:hover:text-teal-300 underline font-semibold`}
                    >
                      browse
                    </button>
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center rounded-xl backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p
                      className={`text-md font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) =>
                  e.target.files?.[0] && handleImageUpload(e.target.files[0])
                }
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="post-title"
              className={`block text-lg font-semibold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Title *
            </label>
            <input
              id="post-title"
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className={`w-full px-5 py-3 text-3xl font-bold font-playfair rounded-lg border transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-teal-500 focus:border-transparent ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="Enter your captivating blog title..."
              aria-label="Blog Post Title"
            />
          </div>

          <div>
            <label
              htmlFor="post-author"
              className={`block text-lg font-semibold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Author *
            </label>
            <input
              id="post-author"
              type="text"
              value={post.author}
              onChange={(e) => setPost({ ...post, author: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="post-category"
              className={`block text-lg font-semibold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Category *
            </label>
            <select
              id="post-category"
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <section>
            <label
              htmlFor="post-content"
              className={`block text-lg font-semibold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Content *
            </label>
            <JoditEditor
              id="post-content"
              ref={editor}
              value={post.content}
              config={joditConfig}
              onChange={(newContent) =>
                setPost({ ...post, content: newContent })
              }
            />
          </section>

          <div>
            <label
              htmlFor="post-tags"
              className={`block text-lg font-semibold mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Tags * (Select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    post.tags.includes(tag)
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-700/50 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-t mt-16`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span
                className={`text-2xl font-bold font-playfair ${
                  darkMode ? "text-teal-400" : "text-teal-600"
                }`}
              >
                BlogSpace
              </span>
            </Link>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              © 2024 BlogSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
