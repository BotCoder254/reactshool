import { motion } from 'framer-motion';
import { FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-white"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Learning Experience
          </h1>
          <p className="text-lg md:text-xl mb-8 text-light">
            A modern school management system that empowers teachers and students to achieve more.
          </p>
          <div className="flex gap-4">
            <Link 
              to="/register"
              className="bg-accent text-primary px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-light transition-colors"
            >
              Get Started <FaArrowRight />
            </Link>
            <Link 
              to="/login"
              className="border-2 border-light text-light px-8 py-3 rounded-lg font-semibold hover:bg-light hover:text-primary transition-colors"
            >
              Login
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 mt-10 md:mt-0"
        >
          <img 
            src="https://illustrations.popsy.co/white/student-work.svg" 
            alt="Education Illustration"
            className="w-full max-w-lg mx-auto"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero; 