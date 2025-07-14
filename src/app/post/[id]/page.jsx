"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Upload,
  X,
  Edit,
  Save,
  Eye,
  Sun,
  Moon,
  Calendar,
  User,
  Tag,
  Trash,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function SingleBlogPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleTagToggle = (tagToToggle) => {
    setEditedPost((prev) => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tagToToggle)) {
        return {
          ...prev,
          tags: currentTags.filter((tag) => tag !== tagToToggle),
        };
      } else {
        return {
          ...prev,
          tags: [...currentTags, tagToToggle],
        };
      }
    });
  };

  const DeleteBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/Delete/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      console.log(data.message);
      router.push("/");
    } catch (error) {
      console.error("Error deleting blog:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/GetBlogs/${params.id}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPost(data);
      setEditedPost({ ...data, tags: data.tags || [] });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to fetch blog post.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

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
    setDarkMode((prevMode) => !prevMode);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!editedPost) return;
    if (!editedPost.title.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    if (!editedPost.content.trim()) {
      toast.error("Content cannot be empty.");
      return;
    }
    if (!editedPost.category) {
      toast.error("Please select a category.");
      return;
    }
    if (!editedPost.tags || editedPost.tags.length === 0) {
      toast.error("Please select at least one tag.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append(
        "post",
        JSON.stringify({
          title: editedPost.title,
          content: editedPost.content,
          author: editedPost.author,
          publishDate: editedPost.publishDate,
          tags: editedPost.tags,
          category: editedPost.category,
        })
      );
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch(`/api/Update/${params.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update blog post: ${response.status}`);
      }

      const updatedPostData = await response.json();
      setPost({ id: updatedPostData._id, ...updatedPostData });
      setEditedPost({
        id: updatedPostData._id,
        ...updatedPostData,
        tags: updatedPostData.tags || [],
      });
      setSelectedFile(null);
      setIsEditing(false);
      setIsPreview(false);
      toast.success("Blog post updated successfully!");
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to save changes. Please try again.");
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setEditedPost({ ...post, tags: post.tags || [] });
    setIsEditing(false);
    setIsPreview(false);
    setSelectedFile(null);
    toast.info("Changes discarded.");
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPEG and PNG files are allowed.");
      return;
    }
    setSelectedFile(file);

    setIsUploading(true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const imageUrl = URL.createObjectURL(file);
      if (editedPost) {
        setEditedPost((prev) => ({
          ...prev,
          imageUrl,
        }));
      }
      toast.success("Image selected for upload!");
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error("Failed to process image.");
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload(e.dataTransfer.files[0]);
      }
    },
    [handleImageUpload]
  );

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const renderMarkdown = (content) => {
    if (!content) return "";
    let htmlContent = content;

    htmlContent = htmlContent.replace(
      /^###### (.*$)/gim,
      `<h6 class="text-base sm:text-lg font-bold font-playfair mb-2 mt-4 ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</h6>`
    );
    htmlContent = htmlContent.replace(
      /^##### (.*$)/gim,
      `<h5 class="text-lg sm:text-xl font-bold font-playfair mb-2 mt-5 ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</h5>`
    );
    htmlContent = htmlContent.replace(
      /^#### (.*$)/gim,
      `<h4 class="text-xl sm:text-2xl font-bold font-playfair mb-3 mt-6 ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</h4>`
    );
    htmlContent = htmlContent.replace(
      /^### (.*$)/gim,
      `<h3 class="text-2xl sm:text-3xl font-bold font-playfair mb-3 mt-6 ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</h3>`
    );
    htmlContent = htmlContent.replace(
      /^## (.*$)/gim,
      `<h2 class="text-3xl sm:text-4xl font-bold font-playfair mb-4 mt-8 ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</h2>`
    );
    htmlContent = htmlContent.replace(
      /^# (.*$)/gim,
      `<h1 class="text-4xl sm:text-5xl font-extrabold font-playfair mb-6 ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</h1>`
    );

    htmlContent = htmlContent.replace(
      /\*\*(.*?)\*\*/gim,
      `<strong class="font-semibold ${
        darkMode ? "text-white" : "text-gray-900"
      }">$1</strong>`
    );
    htmlContent = htmlContent.replace(
      /\*(.*?)\*/gim,
      "<em class='italic'>$1</em>"
    );

    htmlContent = htmlContent.replace(
      /^- (.*$)/gim,
      `<li class="ml-4 mb-2 list-disc ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }">$1</li>`
    );
    htmlContent = htmlContent.replace(
      /^\d+\. (.*$)/gim,
      `<li class="ml-4 mb-2 list-decimal ${
        darkMode ? "text-gray-300" : "text-gray-700"
      }">$1</li>`
    );

    htmlContent = htmlContent.replace(/([^\n]\n)(?=[^\n])/g, "$1<br>");

    htmlContent = htmlContent.replace(
      /\n\n/g,
      `</p><p class="mb-4 sm:mb-6 leading-relaxed ${
        darkMode ? "text-gray-300" : "text-gray-700"
      } text-base sm:text-lg">`
    );

    htmlContent = `<p class="mb-4 sm:mb-6 leading-relaxed ${
      darkMode ? "text-gray-300" : "text-gray-700"
    } text-base sm:text-lg">${htmlContent}</p>`;

    htmlContent = htmlContent.replace(/<p[^>]*><\/p>/g, "");

    return htmlContent;
  };

  const joditConfig = {
    height: "auto",
    minHeight: 400,
    toolbarAdaptive: true,
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

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "dark bg-gray-900" : "bg-white"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-teal-500"></div>
        <p
          className={`ml-4 text-base sm:text-lg ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Loading blog post...
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "dark bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1
            className={`text-2xl sm:text-3xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Blog Post Not Found
          </h1>
          <p
            className={`mb-6 text-sm sm:text-base ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            The blog post you are looking for does not exist or has been
            removed.
          </p>
          <Link
            href="/"
            className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              darkMode
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-white"
      }`}
    >
      <Toaster position="top-right" reverseOrder={false} />

      <nav
        className={`sticky top-0 z-50 ${
          darkMode
            ? "bg-gray-900/95 border-gray-700"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm border-b shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:h-16">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-teal-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-6">
                  <span className="text-white font-extrabold text-lg sm:text-xl">
                    B
                  </span>
                </div>
                <span
                  className={`text-xl sm:text-2xl font-bold font-playfair ${
                    darkMode ? "text-teal-400" : "text-teal-600"
                  } transition-colors duration-200`}
                >
                  BlogSpace
                </span>
              </Link>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg sm:hidden ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                } transition-colors`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-0">
              <Link
                href="/"
                className={`flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                  darkMode
                    ? "text-gray-400 hover:text-teal-400"
                    : "text-gray-600 hover:text-teal-600"
                } transition-colors duration-200`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Back
              </Link>
              {isEditing && (
                <>
                  <button
                    onClick={() => setIsPreview(!isPreview)}
                    className={`flex items-center px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium ${
                      isPreview
                        ? "bg-gold-100 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    } hover:bg-gold-200 dark:hover:bg-gold-900/30`}
                  >
                    <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                    {isPreview ? "Edit" : "Preview"}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-white mr-1 sm:mr-2"></span>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1 sm:mr-2" />
                        Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium"
                  >
                    <X className="w-4 h-4 mr-1 sm:mr-2" />
                    Cancel
                  </button>
                </>
              )}
              {!isEditing && (
                <>
                  <button
                    className={`flex items-center px-3 sm:px-4 py-2 ${
                      darkMode
                        ? "bg-red-800 hover:bg-red-700 text-gray-300"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                    } rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium`}
                    onClick={DeleteBlogs}
                  >
                    <Trash className="w-4 h-4 mr-1 sm:mr-2" />
                    Delete
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 mr-1 sm:mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg hidden sm:block ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } transition-colors`}
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {isEditing && !isPreview ? (
          <div className="space-y-6 sm:space-y-8">
            <section>
              <label
                htmlFor="hero-image-upload"
                className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Hero Image
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 ${
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
                {editedPost?.imageUrl ? (
                  <div className="relative group">
                    <Image
                      src={editedPost.imageUrl}
                      alt="Preview"
                      width={800}
                      height={400}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
                      priority
                    />
                    <button
                      onClick={() => {
                        setEditedPost((prev) => ({ ...prev, imageUrl: "" }));
                        setSelectedFile(null);
                        toast.success("Image removed.");
                      }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload
                      className={`w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm sm:text-lg font-medium mb-2 ${
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
                      className={`text-xs sm:text-sm ${
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
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                      <p
                        className={`text-sm sm:text-md font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  </div>
                )}
                <input
                  id="hero-image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) =>
                    e.target.files?.[0] && handleImageUpload(e.target.files[0])
                  }
                  className="hidden"
                />
              </div>
            </section>

            <section>
              <label
                htmlFor="post-title"
                className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Title
              </label>
              <input
                id="post-title"
                type="text"
                value={editedPost?.title || ""}
                onChange={(e) =>
                  setEditedPost((prev) => ({ ...prev, title: e.target.value }))
                }
                className={`w-full px-4 sm:px-5 py-2 sm:py-3 text-xl sm:text-3xl font-bold font-playfair rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-teal-500 focus:border-transparent ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Enter your captivating blog title..."
                aria-label="Blog Post Title"
              />
            </section>

            <section>
              <label
                htmlFor="post-content"
                className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Content{" "}
                <span className="text-xs sm:text-sm font-normal">
                  (Markdown supported)
                </span>
              </label>
              <JoditEditor
                id="post-content"
                ref={editor}
                value={editedPost?.content || ""}
                config={joditConfig}
                onBlur={(newContent) =>
                  setEditedPost((prev) => ({ ...prev, content: newContent }))
                }
              />
            </section>

            <section className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="post-author"
                  className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Author
                </label>
                <input
                  id="post-author"
                  type="text"
                  value={editedPost?.author || ""}
                  onChange={(e) =>
                    setEditedPost((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                  placeholder="Author Name"
                />
              </div>
              <div>
                <label
                  htmlFor="publish-date"
                  className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Publish Date
                </label>
                <input
                  id="publish-date"
                  type="date"
                  value={
                    editedPost?.publishDate
                      ? new Date(editedPost.publishDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditedPost((prev) => ({
                      ...prev,
                      publishDate: e.target.value,
                    }))
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </section>

            <section>
              <label
                htmlFor="post-category"
                className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Category
              </label>
              <select
                id="post-category"
                value={editedPost?.category || ""}
                onChange={(e) =>
                  setEditedPost((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className={`w-full px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </section>

            <section>
              <label
                htmlFor="post-tags"
                className={`block text-base sm:text-lg font-semibold mb-2 sm:mb-3 ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Tags{" "}
                <span className="text-xs sm:text-sm font-normal">
                  (click to add/remove)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 ${
                      editedPost?.tags?.includes(tag)
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-700/50 hover:text-teal-600 dark:hover:text-teal-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <article className="prose prose-sm sm:prose-lg max-w-none mx-auto">
            <div className="relative h-64 sm:h-96 overflow-hidden rounded-2xl mb-6 sm:mb-8 shadow-xl">
              <Image
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-2xl"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                {post.category && (
                  <span className="px-3 sm:px-4 py-1 sm:py-2 bg-teal-600 text-white text-sm sm:text-md font-semibold rounded-full shadow-lg">
                    {post.category}
                  </span>
                )}
              </div>
            </div>

            <header className="mb-6 sm:mb-8">
              <h1
                className={`text-3xl sm:text-4xl md:text-5xl font-bold font-playfair ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-3 sm:mb-4 leading-tight`}
              >
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                <div
                  className={`flex items-center space-x-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags &&
                  post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-sm"
                    >
                      <Tag className="w-3 h-3 sm:w-3 sm:h-3 mr-1 text-teal-500" />
                      {tag}
                    </span>
                  ))}
              </div>
            </header>

            <div
              className={`blog-content ${
                darkMode ? "text-white" : "text-black"
              }`}
              dangerouslySetInnerHTML={{
                __html:
                  isPreview && editedPost
                    ? renderMarkdown(editedPost.content)
                    : renderMarkdown(post.content),
              }}
            />
          </article>
        )}
      </main>

      <footer
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-t mt-12 sm:mt-16 py-6 sm:py-8 shadow-inner`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 mb-3 sm:mb-4 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-teal-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-extrabold text-lg sm:text-xl">
                  B
                </span>
              </div>
              <span
                className={`text-xl sm:text-2xl font-bold font-playfair ${
                  darkMode ? "text-teal-400" : "text-teal-600"
                } transition-colors duration-200`}
              >
                BlogSpace
              </span>
            </Link>
            <p
              className={`${
                darkMode ? "text-gray-400" : "text-gray-600"
              } text-xs sm:text-sm`}
            >
              © {new Date().getFullYear()} BlogSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
