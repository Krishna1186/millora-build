
const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About Millora
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded by industry veterans with decades of experience in hardware manufacturing 
                and electronics prototyping, Millora was born from a simple observation: the gap 
                between innovative ideas and reliable manufacturing was too wide.
              </p>
              <p>
                Our platform bridges this gap by creating a trusted ecosystem where customers can 
                find the right manufacturing partners for their projects, while manufacturers can 
                showcase their capabilities to a global audience of innovators.
              </p>
              <p>
                We believe in the power of collaboration and the importance of quality. Every 
                manufacturer on our platform is carefully vetted, and every project is supported 
                by our dedicated team of industry experts.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-gray-600">Verified Manufacturers</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-primary mb-2">10k+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
