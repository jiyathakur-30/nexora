import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const FloatingMentor: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate('/mentor')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Ask Nexora AI"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1000
      }}
    >
      <MessageCircle size={28} />
    </motion.button>
  );
};

export default FloatingMentor;
