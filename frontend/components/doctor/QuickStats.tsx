"use client";

export default function QuickStats() {

    const stats=[

        ["❤️ Heart","72 BPM"],

        ["🩸 BP","120 / 80"],

        ["🫁 SpO₂","98%"],

        ["🌡 Temp","98.6°F"]

    ]

    return(

        <div className="grid gap-4 md:grid-cols-4">

            {stats.map(([title,value])=>(

                <div
                    key={title}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5"
                >

                    <p className="text-sm text-slate-400">

                        {title}

                    </p>

                    <h2 className="mt-3 text-2xl font-bold">

                        {value}

                    </h2>

                </div>

            ))}

        </div>

    )

}