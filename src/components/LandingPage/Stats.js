import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { FaUserGraduate, FaChalkboardTeacher, FaBook } from 'react-icons/fa';

const stats = [
  {
    icon: <FaUserGraduate className="text-4xl text-accent" />,
    value: 1000,
    label: 'Students',
    suffix: '+'
  },
  {
    icon: <FaChalkboardTeacher className="text-4xl text-accent" />,
    value: 50,
    label: 'Teachers',
    suffix: '+'
  },
  {
    icon: <FaBook className="text-4xl text-accent" />,
    value: 100,
    label: 'Classes',
    suffix: '+'
  }
];

const Counter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
    fallbackInView: true
  });

  useEffect(() => {
    let isMounted = true;

    if (inView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = Math.ceil(end / (duration / 16));
      const startTime = Date.now();

      const updateCount = () => {
        if (!isMounted) return;

        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        if (elapsed < duration) {
          start += increment;
          if (start > end) {
            setCount(end);
          } else {
            setCount(start);
            requestAnimationFrame(updateCount);
          }
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(updateCount);
    }

    return () => {
      isMounted = false;
    };
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const Stats = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-light max-w-2xl mx-auto">
            Join our growing community of learners and educators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg p-8 rounded-lg text-center"
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-4xl font-bold text-white mb-2">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-light text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats; 