export const metadata = { title: 'Contact | CalcPro', description: 'Get in touch with the CalcPro team.' };

export default function ContactPage() {
  return (
    <div className="prose prose-slate max-w-2xl">
      <h1 className="font-heading text-3xl font-extrabold text-slate-900">Contact Us</h1>
      <p>
        Found an error in a calculator, or have a request for a new one? Reach out at{' '}
        <a href="mailto:hello@calcpro.example.com">hello@calcpro.example.com</a>.
      </p>
    </div>
  );
}
