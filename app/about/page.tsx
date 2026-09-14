export const metadata = { title: 'About | CalcPro', description: 'Learn more about CalcPro and our mission.' };

export default function AboutPage() {
  return (
    <div className="prose prose-slate max-w-2xl">
      <h1 className="font-heading text-3xl font-extrabold text-slate-900">About CalcPro</h1>
      <p>
        CalcPro was built on a simple idea: everyday calculations — loans, investments, health metrics, taxes —
        shouldn't require sign-ups, ads that jump around the page, or confusing spreadsheets. We built a fast,
        accurate, and free calculator for every one of those moments.
      </p>
      <p>
        Every calculator on CalcPro is reviewed for accuracy and kept simple to use, whether you're planning a loan,
        tracking your health, or working out your taxes.
      </p>
    </div>
  );
}
