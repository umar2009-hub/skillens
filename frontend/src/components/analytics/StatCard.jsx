import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { motion } from 'framer-motion';

export function StatCard({ title, value, icon: Icon, subtitle, colorClass }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="h-full">
      <Card className="h-full bg-black/40 backdrop-blur-sm border-white/5 hover:border-white/10 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-2xl font-bold text-white">{value}</h3>
              {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
            </div>
            {Icon && (
              <div className={`p-3 rounded-xl bg-opacity-20 ${colorClass}`}>
                <Icon size={20} className="opacity-80" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
