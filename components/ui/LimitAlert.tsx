'use client'

interface LimitAlertProps {
  modelName: string
  className?: string
}

export function LimitAlert({ modelName, className = '' }: LimitAlertProps) {
  return (
    <div
      className={`p-4 bg-[#FFBBE2] border border-[#F3A0CE] rounded-[20px] text-[#4C0028] shadow-xs flex items-start gap-3 ${className}`}
    >
      <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0 text-sm">
        ⚠️
      </div>
      <div>
        <h4 className="text-[13px] font-bold">Daily Request Limit Hit: {modelName}</h4>
        <p className="text-[12px] opacity-90 mt-0.5">
          You have reached the free tier daily request limit for this model. Switch to another model in the dropdown above to continue generating for free!
        </p>
      </div>
    </div>
  )
}
