"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, MessageCircle, Mic, MicOff, PhoneOff, Send, Video, VideoOff } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ZoomChat() {
  const [activeChat, setActiveChat] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  const contacts = [
    { id: 1, name: "Alice", avatar: "https://api.dicebear.com/6.x/initials/svg?seed=Alice", status: "online" },
    { id: 2, name: "Bob", avatar: "https://api.dicebear.com/6.x/initials/svg?seed=Bob", status: "online" },
    { id: 3, name: "Charlie", avatar: "https://api.dicebear.com/6.x/initials/svg?seed=Charlie", status: "offline" },
    { id: 4, name: "David", avatar: "https://api.dicebear.com/6.x/initials/svg?seed=David", status: "online" },
    { id: 5, name: "Eve", avatar: "https://api.dicebear.com/6.x/initials/svg?seed=Eve", status: "offline" },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
    }

    const initialChats = {};
    contacts.forEach(contact => {
      initialChats[contact.id] = [];
    });
    setChats(initialChats);
  }, [router]);

  const toggleCall = () => {
    if (!isInCall) {
      setIsInCall(true);
    } else {
      setIsInCall(false);
      setIsMuted(false);
      setIsVideoOn(true);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && activeChat !== null) {
      const newMessage = {
        id: (chats[activeChat]?.length || 0) + 1,
        sender: currentUser.name,
        content: message.trim(),
        timestamp: new Date(),
      };
      setChats((prevChats) => ({
        ...prevChats,
        [activeChat]: [...(prevChats[activeChat] || []), newMessage],
      }));
      setMessage("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/login');
  };

  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r transition-all duration-300 ease-in-out overflow-hidden md:w-80`}>
        <div className="p-4 border-b flex justify-between items-center">
          <Input placeholder="Search contacts..." className="w-full" />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowSidebar(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer ${
                activeChat === contact.id ? "bg-gray-100" : ""
              }`}
              onClick={() => setActiveChat(contact.id)}
            >
              <Avatar>
                <AvatarImage src={contact.avatar} />
                <AvatarFallback>{contact.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{contact.name}</div>
                <div className="text-sm text-gray-500">{contact.status}</div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowSidebar(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            {activeChat !== null && (
              <>
                <Avatar>
                  <AvatarImage src={contacts.find((c) => c.id === activeChat)?.avatar} />
                  <AvatarFallback>{contacts.find((c) => c.id === activeChat)?.name[0]}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{contacts.find((c) => c.id === activeChat)?.name}</div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={isInCall ? "destructive" : "default"} size="icon">
                  {isInCall ? <PhoneOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isInCall ? "End Call" : "Start Video Call"}</DialogTitle>
                  <DialogDescription>
                    {isInCall
                      ? "Are you sure you want to end the current call?"
                      : "Do you want to start a video call with this contact?"}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {}}>Cancel</Button>
                  <Button onClick={toggleCall}>{isInCall ? "End Call" : "Start Call"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            {isInCall && (
              <>
                <Button variant={isMuted ? "secondary" : "ghost"} size="icon" onClick={toggleMute}>
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                
                </Button>
                <Button variant={isVideoOn ? "ghost" : "secondary"} size="icon" onClick={toggleVideo}>
                  {isVideoOn ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        {/* Chat or Video Area */}
        <Tabs defaultValue="chat" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="flex-1 p-4 bg-gray-100">
            <ScrollArea className="h-[calc(100vh-200px)] pr-4">
              {activeChat !== null && chats[activeChat] ? (
                <div className="space-y-4">
                  {chats[activeChat].map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.sender === currentUser.name ? "bg-blue-100 ml-auto" : "bg-white"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-10">Select a contact to start chatting</div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="video" className="flex-1">
            <div className="bg-gray-800 h-full rounded-lg flex items-center justify-center text-white">
              {isInCall ? (
                isVideoOn ? (
                  <video className="w-full h-full object-cover rounded-lg" autoPlay muted playsInline>
                    <source src="/placeholder-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-center">
                    <Camera className="h-16 w-16 mx-auto mb-4" />
                    <p>Your video is off</p>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <p>Start a video call</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={activeChat === null}
            />
            <Button type="submit" disabled={activeChat === null || message.trim() === ""}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}