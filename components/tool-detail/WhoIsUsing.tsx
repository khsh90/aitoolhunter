/**
 * Who Is Using Component
 * Displays user types and personas
 */

interface WhoIsUsingProps {
    users: string[];
}

export default function WhoIsUsing({ users }: WhoIsUsingProps) {
    if (!users || users.length === 0) return null;

    return (
        <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                👥 Who's Using This?
            </h2>

            <div className="flex flex-wrap gap-3">
                {users.map((user, index) => (
                    <div
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-700"
                    >
                        <svg
                            className="w-4 h-4 text-purple-600 dark:text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            {user}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
