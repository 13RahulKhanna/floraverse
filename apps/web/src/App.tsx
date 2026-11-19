import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { ExplorePage } from "@/pages/ExplorePage";
import { PlantDetailPage } from "@/pages/PlantDetailPage";
import { AiDoctorPage } from "@/pages/AiDoctorPage";
import { ComparePage } from "@/pages/ComparePage";
import { GardenPage } from "@/pages/GardenPage";
import { LearnListPage } from "@/pages/LearnListPage";
import { LearnDetailPage } from "@/pages/LearnDetailPage";
import { ConservationPage } from "@/pages/ConservationPage";
import { BlogListPage } from "@/pages/BlogListPage";
import { BlogDetailPage } from "@/pages/BlogDetailPage";
import { NewBlogPostPage } from "@/pages/NewBlogPostPage";
import { NgoDirectoryPage } from "@/pages/NgoDirectoryPage";
import { NgoDetailPage } from "@/pages/NgoDetailPage";
import { NgoRegisterPage } from "@/pages/NgoRegisterPage";
import { NgoDashboardPage } from "@/pages/NgoDashboardPage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/plants/:slug" element={<PlantDetailPage />} />
            <Route path="/ai-doctor" element={<AiDoctorPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/garden" element={<GardenPage />} />
            <Route path="/learn" element={<LearnListPage />} />
            <Route path="/learn/:slug" element={<LearnDetailPage />} />
            <Route path="/conservation" element={<ConservationPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/new" element={<NewBlogPostPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/ngos" element={<NgoDirectoryPage />} />
            <Route path="/ngos/register" element={<NgoRegisterPage />} />
            <Route path="/ngos/dashboard" element={<NgoDashboardPage />} />
            <Route path="/ngos/:id" element={<NgoDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
