"use client";

import Link from "next/link";
import { RiFootballLine } from "@remixicon/react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="flex flex-col items-center gap-6 max-w-md relative z-10">
                {/* Red Card Graphic */}
                <div className="relative flex items-center justify-center w-32 h-32 mb-4 group">
                    <div className="absolute -top-4 right-4 w-16 h-20 bg-red-500 rounded-sm shadow-xl border border-red-600 transform rotate-12 transition-transform duration-300 group-hover:rotate-6 group-hover:-translate-y-2 group-hover:shadow-2xl z-10"></div>
                    <RiFootballLine className="w-20 h-20 text-slate-800 absolute bottom-0 left-2 group-hover:animate-bounce" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
                        Red Card!
                    </h1>
                    <h2 className="text-2xl font-semibold text-red-500">
                        Access Denied
                    </h2>
                </div>

                <p className="text-slate-600 text-lg leading-relaxed">
                    You&apos;re offside! You don&apos;t have the required permissions to access this part of the pitch.
                    If you think this is a referee mistake, please contact support.
                </p>

                <div className="pt-4">
                    <Link
                        href="/"
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary-600 px-8 py-3 text-white focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all hover:bg-primary-700 hover:shadow-lg"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <RiFootballLine className="w-5 h-5 group-hover:animate-spin" />
                            Return to the Home
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
