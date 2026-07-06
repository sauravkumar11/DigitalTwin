"use client";

export default function MedicationPreview() {

    return (

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

            <h2 className="text-lg font-semibold text-white">

                💊 Today's Medication

            </h2>

            <div className="mt-6 space-y-4">

                <Medicine
                    title="Metformin"
                    time="Morning"
                />

                <Medicine
                    title="Vitamin D"
                    time="Afternoon"
                />

                <Medicine
                    title="Atorvastatin"
                    time="Night"
                />

            </div>

        </div>

    )

}

function Medicine({title,time}:{title:string,time:string}){

    return(

        <div className="flex items-center justify-between rounded-xl bg-slate-800/40 p-4">

            <div>

                <h3 className="font-medium text-white">

                    {title}

                </h3>

                <p className="text-sm text-slate-400">

                    {time}

                </p>

            </div>

            <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400">

                Scheduled

            </div>

        </div>

    )

}