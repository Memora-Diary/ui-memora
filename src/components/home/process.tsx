import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Design Your Logic",
    description: "Create complex conditional statements using our visual workflow builder. Combine multiple triggers and conditions with AND/OR operators.",
    color: "from-accent to-purple-600"
  },
  {
    number: "02",
    title: "Connect Data Sources",
    description: "Integrate with smart contracts, APIs, and real-world data feeds. Our platform supports multiple chains and data providers.",
    color: "from-green-400 to-blue-500"
  },
  {
    number: "03",
    title: "Set Actions",
    description: "Define what happens when conditions are met. Transfer assets, execute contracts, or trigger any on-chain action.",
    color: "from-pink-500 to-red-500"
  }
];

export default function Process() {
  return (
    <section className="py-24 bg-lisabona-900" id="learn-more">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-lg text-lisabona-200">
            Build powerful automated workflows in minutes with our intuitive platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur transition duration-500 ease-in-out" 
                   style={{ backgroundImage: `linear-gradient(to right, ${step.color})` }} />
              
              <div className="relative bg-lisabona-800 p-8 rounded-2xl border border-lisabona-700">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r mb-4"
                     style={{ backgroundImage: `linear-gradient(to right, ${step.color})` }}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-lisabona-200">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}