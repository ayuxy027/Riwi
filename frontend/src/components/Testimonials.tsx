const testimonials = [
  {
    content: "The AI analysis is incredibly accurate. It helped me improve my review quality significantly, and the instant MR rewards are a game changer.",
    author: "Alex Chen",
    role: "Elite Reviewer",
    avatar: "AC"
  },
  {
    content: "Finally, a platform where reviews are actually verified. As a business owner, I value the authentic feedback loop MonadReview provides.",
    author: "Sarah Miller",
    role: "Business Owner",
    avatar: "SM"
  },
  {
    content: "Staking adds a layer of trust I haven't seen elsewhere. The speed of Monad makes the whole experience feel like a Web2 app.",
    author: "Jordan K.",
    role: "DeFi User",
    avatar: "JK"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 animate-fade-in-up">Trusted by the Community</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto animate-fade-in-up">
            Join thousands of users building a more transparent internet on Monad.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-[#6E54FF]/30 hover:shadow-xl hover:shadow-[#6E54FF]/5 transition-all duration-300 animate-fade-in-up group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#6E54FF]/10 text-[#6E54FF] rounded-full flex items-center justify-center font-bold border border-[#6E54FF]/20 group-hover:bg-[#6E54FF] group-hover:text-white transition-colors">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-[#6E54FF] transition-colors">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic relative">
                <span className="text-4xl text-[#6E54FF]/20 absolute -top-4 -left-2 font-serif">"</span>
                {testimonial.content}
                <span className="text-4xl text-[#6E54FF]/20 absolute -bottom-4 right-0 font-serif">"</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;