import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AddItem from "./pages/AddItem";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import ForgotPassword from "./pages/ForgotPassword";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import MyDonations from "./pages/MyDonations";
import BrowseItems from "./pages/BrowseItems";
import RequestItem from "./pages/RequestItem";
import AskItem from "./pages/AskItem";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Contribute from "./pages/Contribute";
import Cleanup from "./pages/Cleanup";
import CommunityNeeds from "./pages/CommunityNeeds";

function Layout() {
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/register", "/", ];

  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <div className={`${shouldHideNavbar ? "" : "container mx-auto p-4"}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ask-item"
            element={
              <ProtectedRoute>
                <AskItem />
              </ProtectedRoute>
            }
          />

          <Route
            path="/browse-items"
            element={
              <ProtectedRoute>
                <BrowseItems />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/community-needs"
            element={
              <ProtectedRoute>
                <CommunityNeeds />
              </ProtectedRoute>
            }
          />

          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <MyDonations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-item"
            element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          <Route
            path="/request/:id"
            element={
              <ProtectedRoute>
                <RequestItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contribute/:id"
            element={
              <ProtectedRoute>
                <Contribute />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cleanup"
            element={
              <ProtectedRoute>
                <Cleanup />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

import { ChatProvider } from "./context/ChatContext";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  return (
    <ChatProvider>
        <BrowserRouter>
            <Layout />
            <ChatWidget />
        </BrowserRouter>
    </ChatProvider>
  );
}
