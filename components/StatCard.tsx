import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'pink' | 'blue' | 'purple' | 'green' | 'yellow';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  delay = 0
}) => {
  const colorClasses = {
    pink: 'border-neon-pink shadow-neon-pink',
    blue: 'border-neon-blue shadow-neon-blue',
    purple: 'border-neon-purple shadow-neon-purple',
    green: 'border-neon-green shadow-neon-green',
    yellow: 'border-neon-yellow shadow-neon-yellow',
  };

  const textColorClasses = {
    pink: 'neon-text-pink',
    blue: 'neon-text-blue',
    purple: 'neon-text-purple',
    green: 'neon-text-green',
    yellow: 'neon-text-yellow',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-cyber-dark bg-opacity-90 p-4 rounded-md border border-opacity-75 ${colorClasses[color]} relative overflow-hidden scanner`}
    >
      <div className="flex flex-col">
        <h3 className="text-cyber-text text-sm mb-1 uppercase tracking-wider font-accent">{title}</h3>
        <div className="flex items-center justify-between">
          <span className={`text-2xl font-bold ${textColorClasses[color]}`}>
            {value}
          </span>
          {icon && (
            <span className={`text-2xl ${textColorClasses[color]}`}>
              {icon}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 