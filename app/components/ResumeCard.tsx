import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if(!blob) return;
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
        }

        loadResume();
    }, [imagePath]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000 hover:scale-105 transition-transform">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2 flex-1">
                    {companyName && <h2 className="text-black font-bold text-lg leading-tight">{companyName}</h2>}
                    {jobTitle && <h3 className="text-base text-gray-600 leading-tight">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="text-black font-bold text-lg">Resume</h2>}
                </div>
                <div className="shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full aspect-3/4 overflow-hidden rounded-xl">
                        <img
                            src={resumeUrl}
                            alt="resume preview"
                            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                </div>
                )}
        </Link>
    )
}
export default ResumeCard