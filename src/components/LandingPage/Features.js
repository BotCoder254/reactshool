import { motion } from 'framer-motion';
import { FaChalkboardTeacher, FaBook, FaTasks, FaChartLine } from 'react-icons/fa';

const features = [
  {
    icon: <FaChalkboardTeacher className="text-4xl text-primary" />,
    title: 'Interactive Dashboard',
    description: 'Access all your important information and tools in one centralized location.'
  },
  {
    icon: <FaBook className="text-4xl text-primary" />,
    title: 'Classroom Management',
    description: 'Efficiently manage virtual classrooms, attendance, and course materials.'
  },
  {
    icon: <FaTasks className="text-4xl text-primary" />,
    title: 'Assignment Submission',
    description: 'Submit and grade assignments with ease through our intuitive interface.'
  },
  {
    icon: <FaChartLine className="text-4xl text-primary" />,
    title: 'Progress Tracking',
    description: 'Monitor student progress and performance with detailed analytics.'
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-light">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-primary mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform provides all the tools you need to create an effective learning environment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 