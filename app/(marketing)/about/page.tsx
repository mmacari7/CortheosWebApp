export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Cortheos</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-4">
            Cortheos is building the next generation of AI-powered chat interfaces.
            Our platform combines powerful language models with an intuitive,
            user-friendly experience.
          </p>
          <h2 className="text-2xl font-semibold mb-4 mt-8">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            We believe AI should be accessible, powerful, and easy to use. Cortheos
            is designed to make interacting with AI feel natural and productive.
          </p>
          <h2 className="text-2xl font-semibold mb-4 mt-8">Alpha Program</h2>
          <p className="text-muted-foreground mb-4">
            We're currently in alpha/beta testing. If you have an invite code,
            you can sign up and start using Cortheos today. We're actively developing
            new features and would love your feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
