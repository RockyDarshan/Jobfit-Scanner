import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "../../constants";
import { resume } from "react-dom/server";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JobFit Scanner" },
    { name: "description", content: "smart Feedback for your job search" },
  ];
}

export default function Home() {

    const {auth} = usePuterStore();

    const navigate = useNavigate();

    useEffect(() => {
        if(!auth.isAuthenticated) navigate('/auth?next=/');
},[auth.isAuthenticated])

  return <main className="bg-linear-to-br from-blue-50 via-white to-purple-50 min-h-screen">
    <Navbar/>

    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Track Your Job Applications</h1>
          <p className="hero-subtitle">Review your submissions and get AI-powered feedback to improve your chances</p>
        </div>
        <div className="hero-visual">
          <img src="/images/resume-scan.gif" alt="Resume scanning animation" className="hero-gif" />
        </div>
      </div>
    </section>

    <section className="resumes-section-container">
      <div className="section-header">
        <h2>Your Resume Reviews</h2>
        <p>View detailed feedback and scores for your job applications</p>
      </div>

      {resumes.length > 0 ? (
        <div className="resumes-grid">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume}/>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <img src="/images/resume_01.png" alt="No resumes yet" className="empty-state-image" />
            <h3>No resumes uploaded yet</h3>
            <p>Upload your first resume to get started with AI-powered feedback</p>
            <Link to="/upload" className="upload-button">
              Upload Resume
            </Link>
          </div>
        </div>
      )}
    </section>
  </main>
}
