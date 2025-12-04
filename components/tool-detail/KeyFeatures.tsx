/**
 * Key Features Component
 * Displays a list of key features for an AI tool
 */

interface KeyFeaturesProps {
    features: string[];
}

export default function KeyFeatures({ features }: KeyFeaturesProps) {
    if (!features || features.length === 0) return null;

    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                ✨ Key Features
            </h2>

            <ul className="space-y-3">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mt-0.5">
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
