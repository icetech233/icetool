import { NavLink } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { menuItems } from '../config/menuItems';

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};

type MenuListProps = {
  onNavigate?: () => void;
  collapsed?: boolean;
};

export default function MenuList({ onNavigate, collapsed = false }: MenuListProps) {
  return (
    <motion.nav
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      {menuItems.map((item) => (
        <motion.div key={item.path} variants={itemVariants}>
          <NavLink
            to={item.path}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg py-2 text-sm transition-[background-color,color,padding] duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                isActive
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <span
              className={[
                'truncate transition-[max-width,opacity,margin] duration-200 ease-in-out',
                collapsed
                  ? 'max-w-0 opacity-0 ml-0 pointer-events-none'
                  : 'max-w-[10rem] opacity-100',
              ].join(' ')}
              aria-hidden={collapsed}
            >
              {item.label}
            </span>
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  );
}
