import { AlarmFeed } from '../alarm/AlarmFeed';
import { motion } from 'framer-motion';

export function AlarmFeedView() {
  return (
    <main className="flex-1 flex min-w-0 bg-background-secondary">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto p-6"
      >
        <AlarmFeed />
      </motion.div>
    </main>
  );
}
