
'use client'

import { useState, useRef, useEffect, useMemo } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Heart, Bookmark, Share2, Bell, User, LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"

export default function TazzaKhabar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [likedArticles, setLikedArticles] = useState([])
  const [bookmarkedArticles, setBookmarkedArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [newsData, setNewsData] = useState([])
  const cardsRef = useRef([])
  const audioRef = useRef(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const apiKey = "72937b1fe13f48e698722116a3de47de"
        const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`
        const response = await axios.get(url)
        setNewsData(response.data.articles)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching news:", error)
        setIsLoading(false)
      }
    }

    fetchNewsData()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1"
            entry.target.style.transform = "translateX(0)"
          } else {
            entry.target.style.opacity = "0"
            entry.target.style.transform = "translateX(-20px)"
          }
        })
      },
      { threshold: 0.5 }
    )

    cardsRef.current.forEach((card) => card && observer.observe(card))

    return () => observer.disconnect()
  }, [newsData])

  useEffect(() => {
    if (notificationsEnabled) {
      const interval = setInterval(() => {
        const randomArticle = newsData[Math.floor(Math.random() * newsData.length)]
        addNotification(randomArticle)
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [notificationsEnabled, newsData])

  const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  const smartSearch = (articles, term) => {
    if (!term) return articles

    const searchTerms = term.toLowerCase().split(' ')
    return articles.filter(article => {
      const searchableText = `${article.title} ${article.description} ${article.content}`.toLowerCase()
      return searchTerms.every(term => searchableText.includes(term))
    })
  }

  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  )

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value)
  }

  const filteredNews = useMemo(() => {
    let filtered = smartSearch(newsData, searchTerm)
    if (selectedCategory !== "All") {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }
    return filtered
  }, [newsData, searchTerm, selectedCategory])

  const handleLike = (id) => {
    setLikedArticles((prev) =>
      prev.includes(id) ? prev.filter((articleId) => articleId !== id) : [...prev, id]
    )
  }

  const handleBookmark = (id) => {
    setBookmarkedArticles((prev) =>
      prev.includes(id) ? prev.filter((articleId) => articleId !== id) : [...prev, id]
    )
  }

  const handleShare = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url,
      })
    } else {
      alert("Sharing is not supported on this browser")
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (username && password) {
      setIsLoggedIn(true)
    }
  }

  const handleSignup = (e) => {
    e.preventDefault()
    if (username && password) {
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
    setPassword("")
  }

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev)
  }

  const addNotification = (article) => {
    setNotifications((prev) => [...prev, { id: Date.now(), ...article }])
    audioRef.current.play()
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-6xl font-bold text-orange-500 mb-4"
        >
          Tazza Khabar
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-orange-700"
        >
          Khabar wakt se pehle milegi
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-orange-500 text-white p-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tazza Khabar</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Smart search news..."
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 rounded-full bg-orange-600 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-200" />
            </div>
            <div className="flex items-center space-x-2  ">
              <Bell className={`h-5 w-5 ${notificationsEnabled ? "text-green-400" : "text-white"}`} />
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}

              />
            </div>
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt={username} />
                      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-orange-100">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-orange-700">Welcome to Tazza Khabar</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Log In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-orange-700">Username</Label>
                          <Input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-white border-orange-300 focus:border-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-orange-700">Password</Label>
                          <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white border-orange-300 focus:border-orange-500"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                          Log In
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newUsername" className="text-orange-700">Username</Label>
                          <Input
                            type="text"
                            id="newUsername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-white border-orange-300 focus:border-orange-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-orange-700">Password</Label>
                          <Input
                            type="password"
                            id="newPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white border-orange-300 focus:border-orange-500"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                          Sign Up
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4 text-orange-700">Top News</h2>
        <ScrollArea className="h-[70vh]">
          {filteredNews.map((article, index) => (
            <motion.div
              ref={(el) => (cardsRef.current[index] = el)}
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-lg mb-4 p-4 flex flex-col"
            >
              <h3 className="text-lg font-bold text-orange-700">{article.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{article.description}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLike(article.url)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        likedArticles.includes(article.url)
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmark(article.url)}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${
                        bookmarkedArticles.includes(article.url)
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare(article)}
                  >
                    <Share2 className="h-5 w-5 text-gray-400" />
                  </Button>
                </div>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="link" className="text-orange-500  hover:text-orange-700">
                    Read More
                  </Button>
                </a>
              </div>
            </motion.div>
          ))}
        </ScrollArea>

        {/* Real-time News Notification Dialog */}
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="mb-2"
              >
                <Card className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg border border-orange-200 shadow-lg">
                  <CardContent className="p-4 flex items-start">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-orange-800">{notification.title}</h3>
                      <p className="text-sm text-orange-600 line-clamp-2">{notification.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="ml-2 text-orange-500 hover:text-orange-700"
                    >
                      &times;
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Audio Element for Notification Sound */}
        <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      </main>
    </div>
  )
}