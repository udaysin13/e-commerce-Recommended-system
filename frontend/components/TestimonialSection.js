"use client";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fashion buyer",
    content: "Great deals and quick product discovery. The recommendations helped me compare faster.",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Tech shopper",
    content: "The catalog feels simple to browse, and the product cards show the details I need.",
    rating: 5,
  },
  {
    name: "Emma Davis",
    role: "Home shopper",
    content: "The category filters and similar products make shopping for home items easier.",
    rating: 4,
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-950">Customer ratings</h2>
        <p className="text-sm text-slate-600">Marketplace feedback from demo shoppers</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                {testimonial.rating}.0 star
              </span>
              <p className="text-sm font-bold text-slate-950">{testimonial.name}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">"{testimonial.content}"</p>
            <p className="mt-3 text-xs font-bold text-slate-500">{testimonial.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
