/**
 * Ratings Grid Component
 * Displays detailed ratings in a grid format
 */

interface Ratings {
    accuracyReliability: number;
    easeOfUse: number;
    functionalityFeatures: number;
    performanceSpeed: number;
    customizationFlexibility: number;
    dataPrivacySecurity: number;
    supportResources: number;
    costEfficiency: number;
    integrationCapabilities: number;
    overallScore: number;
}

interface RatingsGridProps {
    ratings: Ratings;
}

const ratingCategories = [
    { key: 'accuracyReliability', label: 'Accuracy & Reliability', icon: '🎯' },
    { key: 'easeOfUse', label: 'Ease of Use', icon: '😊' },
    { key: 'functionalityFeatures', label: 'Functionality & Features', icon: '⚙️' },
    { key: 'performanceSpeed', label: 'Performance & Speed', icon: '⚡' },
    { key: 'customizationFlexibility', label: 'Customization & Flexibility', icon: '🎨' },
    { key: 'dataPrivacySecurity', label: 'Data Privacy & Security', icon: '🔒' },
    { key: 'supportResources', label: 'Support & Resources', icon: '💬' },
    { key: 'costEfficiency', label: 'Cost Efficiency', icon: '💵' },
    { key: 'integrationCapabilities', label: 'Integration Capabilities', icon: '🔗' },
];

function RatingBar({ score, label, icon }: { score: number; label: string; icon: string }) {
    const percentage = (score / 5) * 100;
    const color = score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span>{icon}</span>
                    {label}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {score.toFixed(1)}/5
                </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default function RatingsGrid({ ratings }: RatingsGridProps) {
    if (!ratings) return null;

    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📊 How We Rated It
            </h2>

            {/* Overall Score - Highlighted */}
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
                <div className="text-sm font-medium opacity-90 mb-2">Overall Score</div>
                <div className="text-6xl font-bold mb-2">{ratings.overallScore.toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                            key={star}
                            className={`w-6 h-6 ${star <= Math.round(ratings.overallScore)
                                    ? 'text-yellow-300 fill-current'
                                    : 'text-white/30'
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    ))}
                </div>
            </div>

            {/* Individual Ratings */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ratingCategories.map((category) => (
                    <RatingBar
                        key={category.key}
                        score={ratings[category.key as keyof Ratings]}
                        label={category.label}
                        icon={category.icon}
                    />
                ))}
            </div>
        </section>
    );
}
