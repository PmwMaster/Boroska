import { useState, useRef, useEffect } from 'react';
import frontSvg from '/body-front.svg?raw';
import backSvg from '/body-back.svg?raw';

const FRONT_MUSCLES = {
  'peito': ['chest-left', 'chest-right'],
  'ombro': ['deltoids-left', 'deltoids-right'],
  'biceps': ['biceps-left', 'biceps-right'],
  'abdomen': ['abs-left', 'abs-right'],
  'quadriceps': ['quadriceps-left', 'quadriceps-right'],
  'antebraco': ['forearm-left', 'forearm-right'],
};

const BACK_MUSCLES = {
  'trapezio': ['trapezius-left', 'trapezius-right'],
  'costas': ['upper-back-left', 'upper-back-right', 'lower-back-left', 'lower-back-right'],
  'triceps': ['triceps-left', 'triceps-right'],
  'gluteos': ['gluteal-left', 'gluteal-right'],
  'posterior': ['hamstring-left', 'hamstring-right'],
  'panturrilha': ['calves-left', 'calves-right'],
};

const MUSCLE_LABELS = {
  peito: 'Peito', ombro: 'Ombro', biceps: 'Bíceps', abdomen: 'Abdômen',
  quadriceps: 'Quadríceps', antebraco: 'Antebraço', trapezio: 'Trapézio',
  costas: 'Costas', triceps: 'Tríceps', gluteos: 'Glúteos',
  posterior: 'Posterior', panturrilha: 'Panturrilha',
};

export function BodyMap({ selected, onToggle }) {
  const [view, setView] = useState('front');
  const svgRef = useRef(null);

  const svgContent = view === 'front' ? frontSvg : backSvg;
  const muscleMap = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

  const allMuscleIds = Object.values(muscleMap).flat();

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    allMuscleIds.forEach(id => {
      const el = svg.querySelector(`#${id}`);
      if (!el) return;

      const muscleGroup = Object.entries(muscleMap).find(([, ids]) => ids.includes(id))?.[0];
      if (!muscleGroup) return;

      const isSelected = selected.includes(muscleGroup);

      el.style.cursor = 'pointer';
      el.style.transition = 'fill 0.15s ease, stroke 0.15s ease';

      if (isSelected) {
        el.setAttribute('fill', 'rgba(226, 138, 75, 0.7)');
        el.setAttribute('stroke', '#E28A4B');
      } else {
        el.setAttribute('fill', '#e8e8e8');
        el.setAttribute('stroke', '#1a1a1a');
      }

      const handleClick = () => onToggle(muscleGroup);
      el.removeEventListener('click', handleClick);
      el.addEventListener('click', handleClick);

      const handleEnter = () => {
        if (!selected.includes(muscleGroup)) {
          el.setAttribute('fill', 'rgba(226, 138, 75, 0.3)');
        }
      };
      const handleLeave = () => {
        if (!selected.includes(muscleGroup)) {
          el.setAttribute('fill', '#e8e8e8');
        }
      };
      el.removeEventListener('mouseenter', handleEnter);
      el.removeEventListener('mouseleave', handleLeave);
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });
  }, [selected, view]);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xl)', padding: '1rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', gap: '0.25rem', width: '100%' }}>
        <button onClick={() => setView('front')} style={{
          flex: 1, padding: '0.5rem', textAlign: 'center', cursor: 'pointer',
          background: view === 'front' ? 'var(--primary-start)' : 'var(--surface-hover)',
          color: view === 'front' ? '#fff' : 'var(--foreground-muted)',
          border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
        }}>Frente</button>
        <button onClick={() => setView('back')} style={{
          flex: 1, padding: '0.5rem', textAlign: 'center', cursor: 'pointer',
          background: view === 'back' ? 'var(--primary-start)' : 'var(--surface-hover)',
          color: view === 'back' ? '#fff' : 'var(--foreground-muted)',
          border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
        }}>Costas</button>
      </div>

      <div
        ref={svgRef}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: '100%', maxWidth: '260px' }}
      />

      <div style={{ fontSize: '0.6875rem', color: 'var(--foreground-muted)', textAlign: 'center' }}>
        Clique nos músculos para selecionar
      </div>
    </div>
  );
}
