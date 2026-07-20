import React from 'react';
import { KpiCard } from './KpiCard';
import { KPIItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  kpis: KPIItem[];
}

export const KpiGrid: React.FC<Props> = ({ kpis }) => {
  return (
    <div className={styles.kpiGrid}>
      {kpis.map((kpi) => (
        <KpiCard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  );
};
