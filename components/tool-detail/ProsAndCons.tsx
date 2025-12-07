/**
 * Pros and Cons Component
 * Displays advantages and limitations side by side
 */

interface ProsAndConsProps {
    pros: string[];
    cons: string[];
}

export default function ProsAndCons({ pros, cons }: ProsAndConsProps) {
    if ((!pros || pros.length === 0) && (!cons || cons.length === 0)) return null;

    return (
        <section className="glass rounded-xl p-6 shadow-sm border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
                ⚖️ Pros & Cons
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Pros */}
                {pros && pros.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pros
                        </h3>
                        <ul className="space-y-2">
                            {pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="flex-shrink-0 text-green-400 mt-1">✓</span>
                                    <span className="text-slate-200 leading-relaxed">
                                        {pro}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cons */}
                {cons && cons.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Cons
                        </h3>
                        <ul className="space-y-2">
                            {cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="flex-shrink-0 text-red-400 mt-1">✗</span>
                                    <span className="text-slate-200 leading-relaxed">
                                        {con}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
