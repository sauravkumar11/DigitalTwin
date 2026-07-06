"use client";

export default function AlertsCard() {

    return(

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">

            <h2 className="text-lg font-semibold text-white">

                🚨 Alerts

            </h2>

            <div className="mt-5 space-y-3">

                <Alert
                    color="green"
                    text="Weight Stable"
                />

                <Alert
                    color="yellow"
                    text="Blood Pressure Slightly Elevated"
                />

                <Alert
                    color="red"
                    text="No Critical Alerts"
                />

            </div>

        </div>

    )

}

function Alert({text,color}:{text:string;color:string}){

    const map:any={

        green:"bg-green-500",

        yellow:"bg-yellow-500",

        red:"bg-red-500"

    }

    return(

        <div className="flex items-center gap-3">

            <div className={`h-3 w-3 rounded-full ${map[color]}`}/>

            <span className="text-slate-300">

                {text}

            </span>

        </div>

    )

}