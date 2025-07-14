"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Sun,
  Moon,
  Calendar,
  User,
  Tag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const categories = [
    "All",
    "Technology",
    "Development",
    "Design",
    "Business",
    "Lifestyle",
    "Travel",
    "Food",
  ];

  async function fetchBlogs() {
    try {
      const response = await fetch("/api/GetBlogs", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blogs = await response.json();
      setPosts(blogs);
      setFilteredPosts(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = posts;
    if (selectedCategory !== "All") {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (post.category &&
            post.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, posts, selectedCategory]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getExcerpt = (htmlContent, length = 150) => {
    if (!htmlContent) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.length > length
      ? textContent.substring(0, length) + "..."
      : textContent;
  };

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = filteredPosts.filter(
    (post) => post._id !== featuredPost?._id
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = regularPosts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(regularPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-950" : "bg-gray-100"
      }`}
    >
      <nav
        className={`sticky top-0 z-50 ${
          darkMode
            ? "bg-gray-900/95 border-gray-800"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold font-playfair text-teal-500 dark:text-teal-400">
                BlogSpace
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } hover:text-teal-500 dark:hover:text-teal-400 font-medium transition-colors`}
              >
                Home
              </Link>
              <Link
                href="/post/create"
                className={`${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } hover:text-teal-500 dark:hover:text-teal-400 font-medium transition-colors`}
              >
                Write
              </Link>
              
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-64 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {featuredPost && !loading && (
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-teal-700 text-white">
              <div className="absolute inset-0">
                <Image
                  src={featuredPost.imageUrl || "/placeholder.svg"}
                  alt={featuredPost.title}
                  width={1200}
                  height={600}
                  className="w-full h-full object-cover opacity-20"
                  priority
                />
              </div>
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-3 py-1 bg-amber-400 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="text-teal-100">
                      {featuredPost.category || "Uncategorized"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair mb-4 leading-tight">
                    {featuredPost.title}
                  </h1>
                  <div
                    className="text-lg md:text-xl text-teal-100 mb-6 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: getExcerpt(featuredPost.content, 200),
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-teal-100">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredPost.createdAt)}</span>
                      </div>
                    </div>
                    <Link
                      href={`/post/${featuredPost._id}`}
                      className="inline-flex items-center px-6 py-3 bg-white text-teal-600 dark:text-teal-500 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold font-playfair ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Latest Articles
            </h2>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className={`text-gray-500 dark:text-gray-400`}>
                Trending
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-teal-100 dark:hover:bg-teal-800 hover:text-teal-500 dark:hover:text-teal-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div
                    className={`rounded-xl h-48 mb-4 ${
                      darkMode ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-4 rounded mb-2 ${
                      darkMode ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-4 rounded mb-2 w-3/4 ${
                      darkMode ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`h-3 rounded w-1/2 ${
                      darkMode ? "bg-gray-800" : "bg-gray-200"
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentPosts.map((post) => (
                <article
                  key={post._id}
                  className={`group rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    darkMode
                      ? "bg-gray-800 shadow-gray-900/20"
                      : "bg-white shadow-gray-200/50"
                  } shadow-lg`}
                >
                  <Link href={`/post/${post._id}`}>
                    <div className="relative overflow-hidden">
                      <Image
                        src={post.imageUrl || "/placeholder.svg"}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        priority
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-full">
                          {post.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3
                        className={`text-xl font-bold font-playfair ${
                          darkMode ? "text-gray-100" : "text-gray-900"
                        } mb-3 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-200 line-clamp-2`}
                      >
                        {post.title}
                      </h3>
                      <div
                        className={`text-base ${
                          darkMode ? "text-gray-300" : "text-black"
                        } mb-4 leading-relaxed line-clamp-3`}
                        dangerouslySetInnerHTML={{
                          __html: getExcerpt(post.content),
                        }}
                      />
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <span
                            className={`font-medium ${
                              darkMode ? "text-gray-100" : "text-gray-900"
                            }`}
                          >
                            {post.author}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                          <span className={`text-gray-500 dark:text-gray-400`}>
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {post.tags &&
                          post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md"
                            >
                              <Tag className="w-3 h-3 mr-1 text-gray-400 dark:text-gray-300" />
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
          {!loading && regularPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3
                className={`text-2xl font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                } mb-2`}
              >
                No articles found
              </h3>
              <p
                className={`text-base ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Try adjusting your search terms or browse all categories.
              </p>
            </div>
          )}

          {!loading && regularPosts.length > postsPerPage && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    currentPage === i + 1
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-teal-100 dark:hover:bg-teal-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>

        <section
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-2xl p-8 md:p-12 shadow-lg`}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h2
              className={`text-3xl font-bold font-playfair ${
                darkMode ? "text-gray-100" : "text-gray-900"
              } mb-4`}
            >
              Stay Updated
            </h2>
            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } mb-8`}
            >
              Get the latest articles and insights delivered straight to your
              inbox. No spam, just quality content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  darkMode
                    ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <button className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer
        className={`${
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        } border-t mt-16`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-2xl font-bold font-playfair text-teal-500 dark:text-teal-400">
                  BlogSpace
                </span>
              </Link>
              <p
                className={`text-base ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } mb-4 max-w-md`}
              >
                A modern platform for sharing ideas, insights, and stories.
                Built for writers who value clean aesthetics and powerful
                functionality.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                } mb-4`}
              >
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className={`text-base ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/post/create"
                    className={`text-base ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
                  >
                    Write Article
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={`text-base ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className={`text-base ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                } mb-4`}
              >
                Categories
              </h3>
              <ul className="space-y-2">
                {categories
                  .filter((cat) => cat !== "All")
                  .map((category) => (
                    <li key={category}>
                      <a
                        href="#"
                        className={`text-base ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
                      >
                        {category}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div
            className={`border-t ${
              darkMode ? "border-gray-800" : "border-gray-200"
            } mt-8 pt-8 flex flex-col md:flex-row justify-between items-center`}
          >
            <p
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              © 2024 BlogSpace. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                } hover:text-teal-500 dark:hover:text-teal-400 transition-colors`}
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
