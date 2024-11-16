"use client";

export default function Showcase() {
  const examples = [
    {
      title: "DeFi Automation",
      description: "Automate complex DeFi strategies based on market conditions and portfolio performance.",
      gradient: "from-pink-500 to-violet-500",
    },
    {
      title: "DAO Governance",
      description: "Create conditional proposals that execute based on community voting and treasury metrics.",
      gradient: "from-blue-500 to-teal-500",
    },
    {
      title: "Asset Management",
      description: "Set up sophisticated inheritance and transfer rules based on real-world events.",
      gradient: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <section className="py-24 bg-jacarta-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Endless Possibilities
          </h2>
          <p className="text-lg text-jacarta-200">
            See how communities are using our conditional workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${example.gradient} opacity-5 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
              <div className="relative p-8 bg-jacarta-800 rounded-2xl border border-jacarta-700">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {example.title}
                </h3>
                <p className="text-jacarta-200">
                  {example.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 