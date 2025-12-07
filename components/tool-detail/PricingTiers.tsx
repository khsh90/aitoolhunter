/**
 * Pricing Tiers Component
 * Displays pricing options in card format
 */

interface PricingTier {
    name: string;
    price: string;
    features?: string[];
}

interface PricingTiersProps {
    tiers: PricingTier[];
}

export default function PricingTiers({ tiers }: PricingTiersProps) {
    if (!tiers || tiers.length === 0) return null;

    return (
        <section className="glass rounded-xl p-6 shadow-sm border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
                💰 Pricing
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tiers.map((tier, index) => {
                    const isFree = tier.price.toLowerCase().includes('free');

                    return (
                        <div
                            key={index}
                            className={`relative rounded-lg p-5 border-2 transition-all hover:shadow-lg ${isFree
                                    ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                                    : 'border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20'
                                }`}
                        >
                            {isFree && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg">
                                        FREE
                                    </span>
                                </div>
                            )}

                            <div className="text-center">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                    {tier.name}
                                </h3>
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                                    {tier.price}
                                </div>

                                {tier.features && tier.features.length > 0 && (
                                    <ul className="text-left space-y-2 mt-4">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
