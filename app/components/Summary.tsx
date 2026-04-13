import ScoreBadge from "./ScoreBadge";
import ScoreGauge from "./ScoreGauge"

const Category = ({title, score} : {title : string, score : number}) => {

const textColor = score >= 75 ? 'text-green-500' : score >= 45 ? 'text-yellow-500' : 'text-red-500';  


  return (
    <div className="resume-summary">
        <div className="category ">
          <div className="flex flex-row gap-2 items-center justify-center">
            <p className="text-2xl">{title}</p>
            <ScoreBadge score={score} />
          </div>
          <p className="text-2xl">
             <span className={textColor}>
              {score}
             </span>/100
          </p>
        </div>
    </div>
  )
}

const Summary = ({feedback} : {feedback : Feedback}) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full ">
      <div className="flex flex-row items-center p-4 gap-8">
      <ScoreGauge score={feedback.overallScore} />
      <div className="flex flex-col gap-2">
             <h2 className="text-2xl font-bold">Your Resume Score</h2>
             <p className="text-sm text-gray-500">
              Your resume scored {feedback.overallScore} out of 100. This score is based on various factors such as formatting, content quality, and ATS compatibility. A higher score indicates a stronger resume that is more likely to catch the attention of recruiters and pass through Applicant Tracking Systems (ATS). Use the detailed feedback below to identify areas for improvement and boost your chances of landing your dream job!
             </p>
      </div>
      </div>

    <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
    <Category title="Content" score={feedback.content.score} />
    <Category title="Structure" score={feedback.structure.score} />
    <Category title="Skills" score={feedback.skills.score} />

      </div>
  )
}

export default Summary