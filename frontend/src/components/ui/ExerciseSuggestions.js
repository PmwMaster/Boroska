export const MUSCLE_GROUPS = {
  front: [
    { id: 'peito', label: 'Peito', shape: 'chest' },
    { id: 'ombro', label: 'Ombro', shape: 'shoulders' },
    { id: 'biceps', label: 'Bíceps', shape: 'biceps' },
    { id: 'abdomen', label: 'Abdômen', shape: 'abs' },
    { id: 'quadriceps', label: 'Quadríceps', shape: 'quads' },
    { id: 'antebraco', label: 'Antebraço', shape: 'forearms' },
  ],
  back: [
    { id: 'trapezio', label: 'Trapézio', shape: 'traps' },
    { id: 'costas', label: 'Costas', shape: 'back' },
    { id: 'triceps', label: 'Tríceps', shape: 'triceps' },
    { id: 'gluteos', label: 'Glúteos', shape: 'glutes' },
    { id: 'posterior', label: 'Posterior', shape: 'hamstrings' },
    { id: 'panturrilha', label: 'Panturrilha', shape: 'calves' },
  ],
};

export const MUSCLE_EXERCISES = {
  peito: [
    { name: 'Supino Reto Barra', series: 4, repsMin: 8, repsMax: 12 },
    { name: 'Supino Inclinado Halter', series: 3, repsMin: 10, repsMax: 12 },
    { name: 'Crucifixo Máquina', series: 3, repsMin: 12, repsMax: 15 },
  ],
  ombro: [
    { name: 'Desenvolvimento Barra', series: 4, repsMin: 8, repsMax: 12 },
    { name: 'Elevação Lateral', series: 3, repsMin: 12, repsMax: 15 },
    { name: 'Elevação Frontal', series: 3, repsMin: 12, repsMax: 15 },
  ],
  biceps: [
    { name: 'Rosca Direta Barra', series: 4, repsMin: 8, repsMax: 12 },
    { name: 'Rosca Alternada Halter', series: 3, repsMin: 10, repsMax: 12 },
    { name: 'Rosca Concentrada', series: 3, repsMin: 12, repsMax: 15 },
  ],
  abdomen: [
    { name: 'Abdominal Supra', series: 4, repsMin: 15, repsMax: 20 },
    { name: 'Prancha', series: 3, repsMin: 30, repsMax: 60 },
    { name: 'Elevação de Pernas', series: 3, repsMin: 12, repsMax: 15 },
  ],
  quadriceps: [
    { name: 'Agachamento Livre', series: 4, repsMin: 8, repsMax: 12 },
    { name: 'Leg Press', series: 3, repsMin: 10, repsMax: 12 },
    { name: 'Extensora', series: 3, repsMin: 12, repsMax: 15 },
  ],
  antebraco: [
    { name: 'Rosca Punho', series: 3, repsMin: 12, repsMax: 15 },
    { name: 'Rosca Inversa', series: 3, repsMin: 10, repsMax: 12 },
  ],
  trapezio: [
    { name: 'Encolhimento Halter', series: 4, repsMin: 10, repsMax: 15 },
    { name: 'Remada Alta', series: 3, repsMin: 10, repsMax: 12 },
  ],
  costas: [
    { name: 'Puxada Frontal', series: 4, repsMin: 8, repsMax: 12 },
    { name: 'Remada Curvada', series: 3, repsMin: 10, repsMax: 12 },
    { name: 'Pulldown Corda', series: 3, repsMin: 12, repsMax: 15 },
  ],
  triceps: [
    { name: 'Tríceps Pulley', series: 4, repsMin: 10, repsMax: 12 },
    { name: 'Tríceps Testa', series: 3, repsMin: 8, repsMax: 12 },
    { name: 'Mergulho Banco', series: 3, repsMin: 12, repsMax: 15 },
  ],
  gluteos: [
    { name: 'Elevação Pélvica', series: 4, repsMin: 10, repsMax: 12 },
    { name: 'Afundo', series: 3, repsMin: 10, repsMax: 12 },
    { name: 'Abdução Máquina', series: 3, repsMin: 12, repsMax: 15 },
  ],
  posterior: [
    { name: 'Stiff', series: 4, repsMin: 8, repsMax: 12 },
    { name: 'Mesa Flexora', series: 3, repsMin: 10, repsMax: 12 },
    { name: 'Flexora Unilateral', series: 3, repsMin: 12, repsMax: 15 },
  ],
  panturrilha: [
    { name: 'Panturrilha Sentado', series: 4, repsMin: 12, repsMax: 15 },
    { name: 'Panturrilha em Pé', series: 4, repsMin: 12, repsMax: 15 },
  ],
};
